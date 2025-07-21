import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Switch, Input } from 'antd';
import { search } from '@/api/search'

export function Home() {
  const [messages, setMessages] = useState<Array<{text: string; isUser: boolean}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const oldMessage = [...messages, { text: inputValue, isUser: true }];
      setMessages([...oldMessage]);
      setInputValue('');
      const message = { text: "", isUser: false };
      const response = await search({ query: inputValue, isKnowledge: useKnowledgeBase + '' });
      // 流式读取数据
      const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
      if (!reader) return;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // 解析SSE数据块
        value.split("\n\n").forEach(chunk => {
          if (chunk.startsWith('data: ')) {
            const data = JSON.parse(chunk.replace("data: ", ""));
            message.text += data.content;
            setMessages([...oldMessage, message]);
          }
        })
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-6xl h-screen flex flex-col p-4">
        {/* 头部区域 */}
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            智能知识问答
          </h1>
          <p className="text-gray-600 text-lg">基于向量数据库的智能对话助手</p>
        </header>

        {/* 主聊天区域 */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
          {/* 消息显示区域 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 空状态 */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">开始你的智能对话</h3>
                <p className="text-center max-w-md">问我任何问题，我会根据知识库为你提供准确的答案</p>
              </div>
            )}
            
            {/* 消息列表 */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex items-start max-w-2xl ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 头像 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.isUser 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-3' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 mr-3'
                  }`}>
                    {msg.isUser ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* 消息气泡 */}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-md'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm p-6">
            {/* 知识库开关 */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-gray-200/50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-gray-700">知识库检索</span>
                <Switch
                  checked={useKnowledgeBase}
                  onChange={setUseKnowledgeBase}
                  checkedChildren="开"
                  unCheckedChildren="关"
                />
              </div>
            </div>

            {/* 输入框区域 */}
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <Input.TextArea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题，按 Enter 发送..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none shadow-sm"
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <span className="flex items-center space-x-2">
                  <span className="font-medium">发送</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}