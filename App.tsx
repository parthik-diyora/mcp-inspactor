
import React, { useState, useEffect, useCallback } from 'react';
import { mcpService } from './services/mcpService';
import { 
  SystemStatusResponse, 
  RecommendationResponse, 
  LogEntry, 
  AlgorithmType, 
  EventType,
  ProductData
} from './types';
import { StatusBadge } from './components/StatusBadge';
import { ProductCard } from './components/ProductCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [connectionState, setConnectionState] = useState<'online' | 'offline' | 'loading'>('loading');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userId, setUserId] = useState<number>(1);
  const [numRecs, setNumRecs] = useState<number>(3);
  const [algo, setAlgo] = useState<string>(AlgorithmType.EPSILON_GREEDY);
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [recResponse, setRecResponse] = useState<RecommendationResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'recommend' | 'logs' | 'about'>('recommend');

  // Helper to add logs
  const addLog = useCallback((type: LogEntry['type'], endpoint: string, payload: any) => {
    setLogs(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        type,
        endpoint,
        payload
      },
      ...prev
    ].slice(0, 50));
  }, []);

  // Initial load
  const init = useCallback(async () => {
    setConnectionState('loading');
    try {
      const res = await mcpService.getSystemStatus();
      setStatus(res);
      setConnectionState('online');
      addLog('response', 'get_system_status', res);
    } catch (err) {
      setConnectionState('offline');
      addLog('error', 'get_system_status', { message: (err as Error).message });
    }
  }, [addLog]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    addLog('request', 'get_recommendations', { userId, numRecs, algo, epsilon });
    
    try {
      const res = await mcpService.getRecommendations({
        user_id: userId,
        n_recommendations: numRecs,
        algorithm_type: algo,
        algorithm_params: { epsilon }
      });
      setRecResponse(res);
      addLog('response', 'get_recommendations', res);
    } catch (err) {
      addLog('error', 'get_recommendations', { message: (err as Error).message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInteraction = async (productId: number, type: EventType) => {
    addLog('request', 'submit_feedback', { user_id: userId, item_id: productId, event_type: type });
    try {
      const res = await mcpService.submitFeedback({
        user_id: userId,
        item_id: productId,
        event_type: type
      });
      addLog('response', 'submit_feedback', res);
      // Small visual feedback could go here
    } catch (err) {
      addLog('error', 'submit_feedback', { message: (err as Error).message });
    }
  };

  const chartData = recResponse?.confidence_scores.map((score, idx) => ({
    name: `ID ${recResponse.recommendations[idx]}`,
    confidence: score,
    productId: recResponse.recommendations[idx]
  })) || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-brain text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">MCP IMPACTOR</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">RL Recommender Testing Suite</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('recommend')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'recommend' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-shopping-bag mr-2"></i> RECOMMENDATIONS
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-terminal mr-2"></i> LIVE CONSOLE
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'about' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fas fa-info-circle mr-2"></i> SYSTEM INFO
            </button>
          </div>

          <StatusBadge status={connectionState} />
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'recommend' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Config */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Request Config</h2>
                <form onSubmit={handleGetRecommendations} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Identity</label>
                    <input 
                      type="number" 
                      value={userId}
                      onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count</label>
                    <input 
                      type="number" 
                      min="1" max="50"
                      value={numRecs}
                      onChange={(e) => setNumRecs(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Algorithm</label>
                    <select 
                      value={algo}
                      onChange={(e) => setAlgo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value={AlgorithmType.EPSILON_GREEDY}>Epsilon Greedy</option>
                      <option value={AlgorithmType.THOMPSON_SAMPLING}>Thompson Sampling</option>
                      <option value={AlgorithmType.UCB}>UCB</option>
                    </select>
                  </div>
                  {algo === AlgorithmType.EPSILON_GREEDY && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Epsilon: {epsilon}</label>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={epsilon}
                        onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={isProcessing || connectionState !== 'online'}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-bolt"></i>
                    )}
                    <span>GENERATE RECS</span>
                  </button>
                </form>
              </div>

              {chartData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Confidence Distribution</h2>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 1]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {recResponse ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-none">Personalized Results</h2>
                      <p className="text-slate-500 text-sm mt-2">
                        Displaying {recResponse.products.length} items using <span className="font-bold text-indigo-600">{recResponse.algorithm_class}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">User context</span>
                      <p className="font-bold text-slate-800">UID: {recResponse.user_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recResponse.products.map((product, idx) => (
                      <ProductCard 
                        key={product.product_id}
                        product={product}
                        confidence={recResponse.confidence_scores[idx]}
                        onInteract={handleInteraction}
                      />
                    ))}
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900">Training Insight</h4>
                      <p className="text-xs text-indigo-700 mt-1">
                        Interacting with these products will send real-time rewards to the Multi-Armed Bandit model. 
                        The system uses these feedback events to refine its selection strategy for User ID {userId}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                    <i className="fas fa-magnifying-glass text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No Recommendations Yet</h3>
                  <p className="text-slate-500 max-w-sm mt-2">Adjust the parameters on the left and click "Generate Recs" to see the RL engine in action.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 ml-4 uppercase tracking-widest">Live Activity Log</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                CLEAR CONSOLE
              </button>
            </div>
            <div className="p-6 h-[70vh] overflow-y-auto font-mono text-xs space-y-4">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Listening for activity...</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border-l-2 border-slate-700 pl-4 py-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-slate-500 text-[10px]">{log.timestamp.toLocaleTimeString()}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.type === 'request' ? 'bg-blue-900 text-blue-300' :
                        log.type === 'response' ? 'bg-emerald-900 text-emerald-300' :
                        'bg-rose-900 text-rose-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-slate-400 font-bold">{log.endpoint}</span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap break-all overflow-x-hidden">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Server Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">FastMCP HTTP</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">RL MAB</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endpoints</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">3 Active Tools</p>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-4">Exposed Tools</h3>
              <div className="space-y-4">
                {status?.tools.map(tool => (
                  <div key={tool.name} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                        <i className="fas fa-wrench"></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{tool.name}</p>
                        <p className="text-xs text-slate-500">{tool.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-300 transition-colors uppercase tracking-widest">Direct access only</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-4">Reward Mapping Configuration</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Purchase', val: '1.0', color: 'text-emerald-500' },
                    { label: 'Cart', val: '0.33', color: 'text-indigo-500' },
                    { label: 'View', val: '0.1', color: 'text-blue-500' },
                    { label: 'Remove', val: '-0.5', color: 'text-rose-500' },
                  ].map(item => (
                    <div key={item.label} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className={`text-2xl font-black ${item.color} mt-1`}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center space-x-4">
            <span className="text-slate-900">Endpoint: {status?.message || 'Connecting to server...'}</span>
          </div>
          <p>© 2024 MCP IMPACTOR • REINFORCEMENT LEARNING LABS</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
