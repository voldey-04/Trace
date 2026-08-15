import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, Sparkles, HelpCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useTrace } from '../../context/TraceContext';

interface TerminalItem {
  id: string;
  command: string;
  output: string;
  type?: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  timestamp: string;
}

const QUICK_COMMANDS = [
  'help',
  'stats',
  'cases',
  'case CASE-008',
  'search 9000011111',
  'search example-store.in',
  'connections',
  'demo golden',
  'clear',
];

const INITIAL_BANNER: TerminalItem = {
  id: 'banner-0',
  command: 'system-init',
  output: [
    '╔═══════════════════════════════════════════════════════════════════════════╗',
    '║  TRACE — Cross-Case Evidence Intelligence & Entity Extraction Terminal   ║',
    '║  Session: ACTIVE | Engine: DETERMINISTIC v1.0.4 | Grounding: ENABLED      ║',
    '╚═══════════════════════════════════════════════════════════════════════════╝',
    '',
    'Ready for forensic queries. Type "help" for command directory or click quick chips above.',
  ].join('\n'),
  type: 'INFO',
  timestamp: new Date().toISOString(),
};

export const TerminalView: React.FC = () => {
  const { executeTerminalCommand, runGoldenDemo, isProcessing, cases, connections } = useTrace();

  const [history, setHistory] = useState<TerminalItem[]>([INITIAL_BANNER]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [userCommands, setUserCommands] = useState<string[]>([]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom whenever history updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setUserCommands(prev => [...prev, cmd]);
    setHistoryIndex(null);
    setInput('');

    if (cmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }

    const outputLines = executeTerminalCommand(cmd);

    if (outputLines.length === 1 && outputLines[0] === '__CLEAR__') {
      setHistory([]);
      return;
    }

    const outputText = outputLines.join('\n');
    let itemType: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' = 'INFO';

    if (outputText.includes('Error:') || outputText.includes('Unknown command:')) {
      itemType = 'ERROR';
    } else if (outputText.includes('Note:') || outputText.includes('WARNING') || outputText.includes('SUGGESTED')) {
      itemType = 'WARNING';
    } else if (outputText.includes('VERIFIED') || outputText.includes('EXECUTING GOLDEN DEMO') || outputText.includes('CASE SUMMARY')) {
      itemType = 'SUCCESS';
    }

    const newItem: TerminalItem = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      command: cmd,
      output: outputText,
      type: itemType,
      timestamp: new Date().toISOString(),
    };

    setHistory(prev => [...prev, newItem]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (userCommands.length === 0) return;
      const nextIdx = historyIndex === null ? userCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(userCommands[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= userCommands.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIdx);
        setInput(userCommands[nextIdx]);
      }
    }
  };

  const handleClear = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#121619] rounded-lg border border-[#242B30]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#060606] border border-[#242B30] flex items-center justify-center text-[#81A2A2]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#F2F2F2]">TRACE Forensic Command CLI</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30">
                Interactive Shell
              </span>
            </div>
            <p className="text-xs text-[#8A9399]">Direct query interface for cases, indicators, and cross-case intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              runCommand('demo golden');
            }}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#81A2A2]/10 hover:bg-[#81A2A2]/20 text-[#81A2A2] border border-[#81A2A2]/40 rounded text-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exec Golden Demo</span>
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] rounded border border-[#242B30] transition-colors"
            title="Clear terminal screen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-1.5 p-2 sm:p-2.5 bg-[#060606] rounded-lg border border-[#242B30] text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="text-[10px] font-mono uppercase text-[#5F686E] px-1 shrink-0">Quick Run:</span>
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => runCommand(cmd)}
            className="px-2 py-0.5 font-mono text-[11px] bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] hover:text-[#F2F2F2] rounded border border-[#242B30] transition-colors shrink-0"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Screen Canvas */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="bg-[#060606] border border-[#454F56] rounded-lg p-3 sm:p-5 min-h-[380px] sm:min-h-[500px] max-h-[550px] sm:max-h-[650px] flex flex-col font-mono text-xs shadow-2xl overflow-hidden cursor-text"
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242B30] text-[#5F686E] select-none">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C451]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF3C]/60" />
            <span className="text-[10px] sm:text-[11px] text-[#8A9399] ml-1 sm:ml-2">trace_shell_v1.0.4</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-[9px] sm:text-[10px]">
            <span className="text-[#81A2A2]">Cases: {(cases || []).length}</span>
            <span className="text-[#F5C451]">Links: {(connections || []).length}</span>
            <span className="text-[#B7FF3C]">ONLINE</span>
          </div>
        </div>

        {/* Scrollable History Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {history.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center space-x-2 text-[#81A2A2]">
                <span className="text-[#5F686E]">trace@cyber-intel:~$</span>
                <span className="font-bold text-[#F2F2F2] break-all">{item.command}</span>
                <span className="text-[10px] text-[#5F686E] ml-auto font-mono shrink-0">
                  {item.timestamp ? item.timestamp.substring(11, 19) : ''}
                </span>
              </div>

              <div className={`p-2.5 sm:p-3 rounded border font-mono text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto ${
                item.type === 'SUCCESS' ? 'bg-[#121619]/90 border-[#242B30] text-[#F2F2F2]' :
                item.type === 'ERROR' ? 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]' :
                item.type === 'WARNING' ? 'bg-[#F5C451]/10 border-[#F5C451]/30 text-[#F5C451]' :
                'bg-[#121619]/50 border-[#242B30] text-[#8A9399]'
              }`}>
                {item.output}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Interactive CLI Input Line */}
        <form onSubmit={handleSubmit} className="pt-3 mt-3 border-t border-[#242B30] flex items-center space-x-2">
          <span className="text-[#81A2A2] font-bold shrink-0 text-[11px] sm:text-xs">trace@cyber-intel:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help', 'stats', 'cases', 'search <indicator>', 'clear'..."
            className="w-full bg-transparent text-[#F2F2F2] focus:outline-none font-mono text-xs caret-[#81A2A2]"
            autoFocus
          />
          <button
            type="submit"
            className="p-1 text-[#8A9399] hover:text-[#81A2A2] transition-colors shrink-0"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
