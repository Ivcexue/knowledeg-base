import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, isKnowledge } = await request.json();
		
		// 这里需要替换为实际的后端API地址
		const backendUrl = 'http://localhost:3000/search'; // 根据你的后端地址调整
		
		const response = await fetch(backendUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query, isKnowledge })
		});

		if (!response.ok) {
			throw new Error('Backend API request failed');
		}

		// 返回流式响应
		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Transfer-Encoding': 'chunked'
			}
		});
		
	} catch (error) {
		console.error('Search API error:', error);
		
		// 返回模拟的错误响应
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				const errorMessage = {
					content: '抱歉，服务暂时不可用，请稍后重试。'
				};
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
				controller.close();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
}; 