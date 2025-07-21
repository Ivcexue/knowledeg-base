<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { cn } from "$lib/utils";
	import { onMount, tick } from "svelte";

	// 状态管理
	let messages: Array<{ text: string; isUser: boolean }> = $state([]);
	let inputValue = $state('');
	let useKnowledgeBase = $state(false);
	
	// DOM引用
	let inputRef: HTMLTextAreaElement;
	let messagesEndRef: HTMLDivElement;

	// 滚动到底部
	const scrollToBottom = async () => {
		await tick();
		messagesEndRef?.scrollIntoView({ behavior: "smooth" });
	};

	// 发送消息
	const handleSendMessage = async () => {
		if (!inputValue.trim()) return;
		
		const oldMessages = [...messages, { text: inputValue, isUser: true }];
		messages = oldMessages;
		const currentInput = inputValue;
		inputValue = '';
		
		// 创建AI回复消息
		const aiMessage = { text: "", isUser: false };
		
		try {
			// 这里需要替换为实际的API调用
			const response = await fetch('/api/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					query: currentInput, 
					isKnowledge: useKnowledgeBase.toString() 
				})
			});

			if (!response.body) return;
			
			// 流式读取数据
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
			
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				
				// 解析SSE数据块
				value.split("\n\n").forEach(chunk => {
					if (chunk.startsWith('data: ')) {
						try {
							const data = JSON.parse(chunk.replace("data: ", ""));
							aiMessage.text += data.content;
							messages = [...oldMessages, aiMessage];
						} catch (e) {
							console.error('解析数据失败:', e);
						}
					}
				});
			}
		} catch (error) {
			console.error('发送消息失败:', error);
			// 添加错误消息
			aiMessage.text = "抱歉，服务暂时不可用，请稍后重试。";
			messages = [...oldMessages, aiMessage];
		}
		
		await scrollToBottom();
	};

	// 处理回车键
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// 自动滚动到底部
	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
	<div class="container mx-auto max-w-6xl h-screen flex flex-col p-4">
		<!-- 头部区域 -->
		<header class="text-center py-6">
			<h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
				智能知识问答
			</h1>
			<p class="text-gray-600 text-lg">基于向量数据库的智能对话助手</p>
		</header>

		<!-- 主聊天区域 -->
		<div class="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
			<!-- 消息显示区域 -->
			<div class="flex-1 overflow-y-auto p-6 space-y-6">
				<!-- 空状态 -->
				{#if messages.length === 0}
					<div class="flex flex-col items-center justify-center h-full text-gray-500">
						<div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
							<svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">开始你的智能对话</h3>
						<p class="text-center max-w-md">问我任何问题，我会根据知识库为你提供准确的答案</p>
					</div>
				{/if}
				
				<!-- 消息列表 -->
				{#each messages as msg, index (index)}
					<div class={cn("flex animate-fadeIn", msg.isUser ? 'justify-end' : 'justify-start')}>
						<div class={cn("flex items-start max-w-2xl", msg.isUser ? 'flex-row-reverse' : 'flex-row')}>
							<!-- 头像 -->
							<div class={cn(
								"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
								msg.isUser 
									? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-3' 
									: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 mr-3'
							)}>
								{#if msg.isUser}
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>

							<!-- 消息气泡 -->
							<div class={cn(
								"px-4 py-3 rounded-2xl shadow-sm",
								msg.isUser 
									? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
									: 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-md'
							)}>
								<div class="text-sm leading-relaxed whitespace-pre-wrap">
									{msg.text}
								</div>
							</div>
						</div>
					</div>
				{/each}
				<div bind:this={messagesEndRef}></div>
			</div>

			<!-- 输入区域 -->
			<div class="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm p-6">
				<!-- 知识库开关 -->
				<div class="flex items-center justify-center mb-4">
					<div class="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-gray-200/50">
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
						<span class="text-sm font-medium text-gray-700">知识库检索</span>
						
						<!-- 简单的Toggle开关 -->
						<button
							class={cn(
								"relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
								useKnowledgeBase ? 'bg-blue-600' : 'bg-gray-200'
							)}
							onclick={() => useKnowledgeBase = !useKnowledgeBase}
						>
							<span class={cn(
								"inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
								useKnowledgeBase ? 'translate-x-6' : 'translate-x-1'
							)}></span>
						</button>
					</div>
				</div>

				<!-- 输入框区域 -->
				<div class="flex items-end space-x-4">
					<div class="flex-1 relative">
						<textarea
							bind:this={inputRef}
							bind:value={inputValue}
							onkeydown={handleKeyDown}
							placeholder="输入你的问题，按 Enter 发送..."
							rows="1"
							class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none shadow-sm transition-all"
							style="min-height: 48px; max-height: 120px;"
						></textarea>
					</div>
					
					<Button
						onclick={handleSendMessage}
						disabled={!inputValue.trim()}
						class="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none h-12"
					>
						<span class="flex items-center space-x-2">
							<span class="font-medium">发送</span>
							<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out;
	}
</style>