import React, { useState } from 'react';
import { 
  Play, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Network, 
  GitBranch, 
  AlertTriangle, 
  ExternalLink,
  Lock,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { GOLDEN_DEMO_EVIDENCE_PAYLOAD } from '../../data/seedData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedDemoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    runGoldenDemo, 
    isProcessing, 
    setActiveView, 
    setSelectedCaseId, 
    setSelectedConnectionId, 
    cases,
    evidence,
    entities,
    connections 
  } = useTrace();

  const [currentStep, setCurrentStep] = useState(1);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleRunAndJump = async (view: 'case' | 'connections' | 'graph') => {
    await runGoldenDemo();
    onClose();
    if (view === 'case') {
      setActiveView('case-detail', 'CASE-008');
    } else if (view === 'connections') {
      setActiveView('connections');
    } else if (view === 'graph') {
      setActiveView('graph-explorer');
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(GOLDEN_DEMO_EVIDENCE_PAYLOAD.text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#060606]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121619] border border-[#454F56] rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#242B30] flex items-center justify-between bg-[#060606]/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#81A2A2]/10 border border-[#81A2A2]/40 flex items-center justify-center text-[#81A2A2]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#F2F2F2]">Interactive Guided Demo</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <p className="text-xs text-[#8A9399]">
                Evidence → Extraction → Cross-Case Discovery → Intelligence Graph → Actionable Conclusion
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRunAndJump('case')}
              disabled={isProcessing}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Full Run</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Stepper Track */}
        <div className="grid grid-cols-6 border-b border-[#242B30] bg-[#060606]/40 text-center text-[11px] font-mono">
          {[
            { num: 1, label: 'Case Intake' },
            { num: 2, label: 'Evidence & SHA-256' },
            { num: 3, label: 'Entity Extraction' },
            { num: 4, label: 'Cross-Case Match' },
            { num: 5, label: 'Radial Graph' },
            { num: 6, label: 'Conclusion' },
          ].map(s => {
            const isDone = currentStep > s.num;
            const isCurr = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`py-2 px-1 border-r border-[#242B30] last:border-r-0 transition-colors flex items-center justify-center space-x-1 ${
                  isCurr 
                    ? 'bg-[#121619] text-[#81A2A2] font-bold border-b-2 border-b-[#81A2A2]' 
                    : isDone 
                    ? 'text-[#B7FF3C] hover:bg-[#121619]/60' 
                    : 'text-[#5F686E] hover:text-[#8A9399]'
                }`}
              >
                <span className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center border shrink-0 font-mono ${
                  isCurr ? 'border-[#81A2A2] bg-[#81A2A2]/20 text-[#81A2A2]' : isDone ? 'border-[#B7FF3C] bg-[#B7FF3C]/20 text-[#B7FF3C]' : 'border-[#454F56] text-[#5F686E]'
                }">
                  {isDone ? '✓' : s.num}
                </span>
                <span className="hidden md:inline truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Case Intake */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#81A2A2] px-2.5 py-0.5 rounded bg-[#121619] border border-[#242B30]">
                    CASE-008
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF4D4D] px-2.5 py-0.5 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30">
                    PRIORITY: HIGH
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#F2F2F2]">
                  Targeted Executive Smishing Campaign - Corporate Payroll Spoof
                </h4>
                <p className="text-xs text-[#8A9399] leading-relaxed">
                  A Chief Financial Officer (CFO) received an urgent SMS threatening that executive monthly compensation was withheld due to banking gateway failures, instructing immediate phone contact and payment clearance to unblock accounts.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-[#8A9399] border-t border-[#242B30]">
                  <div>Officer: <strong className="text-[#F2F2F2]">Insp. R. Verma</strong></div>
                  <div>Unit: <strong className="text-[#F2F2F2]">Corporate Cyber Defense</strong></div>
                  <div>FIR Status: <strong className="text-[#F2F2F2]">OPEN (Isolated Lead)</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#121619] border border-[#81A2A2]/30 space-y-2">
                <div className="text-xs font-bold text-[#81A2A2] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>The Cybercrime Investigation Challenge</span>
                </div>
                <p className="text-xs text-[#8A9399] leading-relaxed">
                  On the surface, this looks like an isolated executive phishing attempt. Traditional investigation silos fail to notice that the cyber syndicates reuse phones, mule UPI handles, and server infrastructure across completely different crime types.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Forensic Evidence & SHA-256 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#81A2A2]" />
                    <span className="font-mono text-xs font-bold text-[#F2F2F2]">
                      {GOLDEN_DEMO_EVIDENCE_PAYLOAD.fileName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>✓ SHA-256 VERIFIED (Original)</span>
                  </span>
                </div>

                <div className="bg-[#121619] p-3 rounded border border-[#242B30] font-mono text-xs text-[#8A9399] space-y-1">
                  <div className="text-[10px] text-[#5F686E] uppercase tracking-wider">Cryptographic SHA-256 Checksum:</div>
                  <div className="text-[#81A2A2] break-all font-mono text-[11px] select-all bg-[#060606] p-1.5 rounded border border-[#242B30]">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                </div>

                <div className="bg-[#121619] p-3 rounded border border-[#242B30] text-xs text-[#8A9399] space-y-2">
                  <div className="font-mono text-[10px] uppercase text-[#5F686E]">Raw Extracted Artifact Text:</div>
                  <pre className="text-[11px] font-mono text-[#F2F2F2] whitespace-pre-wrap leading-relaxed bg-[#060606] p-2.5 rounded border border-[#242B30]">
                    {GOLDEN_DEMO_EVIDENCE_PAYLOAD.text}
                  </pre>
                </div>
              </div>

              {/* Chain of Custody Box */}
              <div className="p-3 bg-[#121619] rounded-lg border border-[#242B30] space-y-2">
                <div className="text-xs font-bold text-[#F2F2F2] flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#B7FF3C]" />
                  <span>Chain of Custody History</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#060606] border border-[#242B30]">
                    <span className="text-[#5F686E]">09:12 UTC</span>
                    <p className="text-[#F2F2F2] font-sans">Acquired via Cellebrite UFED</p>
                  </div>
                  <div className="p-2 rounded bg-[#060606] border border-[#242B30]">
                    <span className="text-[#5F686E]">09:13 UTC</span>
                    <p className="text-[#F2F2F2] font-sans">Hashed & Uploaded to TRACE</p>
                  </div>
                  <div className="p-2 rounded bg-[#060606] border border-[#242B30]">
                    <span className="text-[#5F686E]">09:14 UTC</span>
                    <p className="text-[#B7FF3C] font-sans">✓ Integrity Confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Entity Extraction */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#F2F2F2]">
                    Deterministic Entity Extraction & Normalization
                  </h4>
                  <span className="text-xs font-mono text-[#81A2A2]">
                    5 Indicators Extracted
                  </span>
                </div>
                <p className="text-xs text-[#8A9399]">
                  TRACE automatically scans the evidence text, normalizes telephone digits (E.164 standard), UPI handles, payment accounts, and web domains with 100% provenance back to the source document.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded bg-[#121619] border border-[#242B30] space-y-1">
                    <span className="text-[10px] font-mono text-[#81A2A2] font-bold uppercase">PHONE NUMBER</span>
                    <div className="font-mono text-xs font-bold text-[#F2F2F2]">+91 9000011111</div>
                    <div className="text-[10px] text-[#5F686E]">Normalized: 9000011111</div>
                  </div>

                  <div className="p-3 rounded bg-[#121619] border border-[#242B30] space-y-1">
                    <span className="text-[10px] font-mono text-[#B7FF3C] font-bold uppercase">PRIMARY UPI HANDLE</span>
                    <div className="font-mono text-xs font-bold text-[#F2F2F2]">traceuser@upi</div>
                    <div className="text-[10px] text-[#5F686E]">Provider: Standard NPCI UPI</div>
                  </div>

                  <div className="p-3 rounded bg-[#121619] border border-[#242B30] space-y-1">
                    <span className="text-[10px] font-mono text-[#B7FF3C] font-bold uppercase">BACKUP UPI HANDLE</span>
                    <div className="font-mono text-xs font-bold text-[#F2F2F2]">invest@upi.test</div>
                    <div className="text-[10px] text-[#5F686E]">Provider: Test Sandbox Gateway</div>
                  </div>

                  <div className="p-3 rounded bg-[#121619] border border-[#242B30] space-y-1">
                    <span className="text-[10px] font-mono text-[#F5C451] font-bold uppercase">MALICIOUS DOMAIN / URL</span>
                    <div className="font-mono text-xs font-bold text-[#F2F2F2]">example-store.in/payroll</div>
                    <div className="text-[10px] text-[#5F686E]">Normalized Host: example-store.in</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Cross-Case Discovery */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-[#F5C451]" />
                  <h4 className="text-sm font-bold text-[#F2F2F2]">
                    Potential Cross-Case Relationships Discovered!
                  </h4>
                </div>
                <p className="text-xs text-[#8A9399]">
                  TRACE ran normalized indicator matching across all independent FIR cases in the database and discovered 2 critical cross-case connections:
                </p>

                {/* Connection 1 */}
                <div className="p-4 rounded-lg bg-[#121619] border border-[#454F56] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#81A2A2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">CASE-008</span>
                      <span className="text-xs text-[#5F686E] font-mono">↔</span>
                      <span className="font-mono text-xs font-bold text-[#81A2A2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">CASE-001</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30 font-bold">
                      HIGH CONFIDENCE (SCORE: 80)
                    </span>
                  </div>

                  <div className="text-xs text-[#8A9399]">
                    Linked Case: <strong className="text-[#F2F2F2]">Operation BlueLoot Telegram Investment Scam</strong>
                  </div>

                  {/* Visual Connection Diagram */}
                  <div className="bg-[#060606] p-3 rounded border border-[#242B30] font-mono text-xs text-[#81A2A2] space-y-1">
                    <div className="text-[10px] text-[#5F686E] uppercase">Shared Identifier Nexus:</div>
                    <div className="text-[#F2F2F2]">CASE-008 ────┐</div>
                    <div className="text-[#B7FF3C]">             ├── PHONE: +91 9000011111</div>
                    <div className="text-[#F2F2F2]">CASE-001 ────┘</div>
                  </div>

                  {/* Explainable Score Breakdown */}
                  <div className="text-[11px] text-[#8A9399] space-y-1">
                    <div className="font-mono text-[10px] uppercase text-[#5F686E]">Score Reasoning:</div>
                    <div className="flex items-center space-x-2 text-[#F2F2F2]">
                      <span className="text-[#B7FF3C] font-mono font-bold">+30 pts</span>
                      <span>Identical phone identifier (+91 9000011111)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#F2F2F2]">
                      <span className="text-[#B7FF3C] font-mono font-bold">+30 pts</span>
                      <span>Corroborating Telegram investment desk link</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#F2F2F2]">
                      <span className="text-[#B7FF3C] font-mono font-bold">+20 pts</span>
                      <span>Multi-case overlap multiplier</span>
                    </div>
                  </div>
                </div>

                {/* Connection 2 */}
                <div className="p-4 rounded-lg bg-[#121619] border border-[#242B30] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#81A2A2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">CASE-008</span>
                      <span className="text-xs text-[#5F686E] font-mono">↔</span>
                      <span className="font-mono text-xs font-bold text-[#81A2A2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">CASE-002</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30 font-bold">
                      MEDIUM CONFIDENCE (SCORE: 70)
                    </span>
                  </div>

                  <div className="text-xs text-[#8A9399]">
                    Linked Case: <strong className="text-[#F2F2F2]">FinBank Impersonation Phishing Ring</strong>
                  </div>

                  <div className="text-[11px] text-[#8A9399] space-y-1">
                    <div className="flex items-center space-x-2 text-[#F2F2F2]">
                      <span className="text-[#B7FF3C] font-mono font-bold">+30 pts</span>
                      <span>Shared UPI handle (invest@upi.test)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#F2F2F2]">
                      <span className="text-[#B7FF3C] font-mono font-bold">+20 pts</span>
                      <span>Matching domain infrastructure (example-store.in)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Radial Graph Explorer */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-[#81A2A2]" />
                    <h4 className="text-sm font-bold text-[#F2F2F2]">
                      Investigation Radial Graph & Cross-Case Nexus
                    </h4>
                  </div>
                  <button
                    onClick={() => handleRunAndJump('graph')}
                    className="text-xs text-[#81A2A2] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Fullscreen Canvas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#8A9399]">
                  The interactive graph visualizes the syndicated network. The shared phone <strong className="text-[#81A2A2] font-mono">+91 9000011111</strong> and payment accounts sit at the geometric center connecting CASE-008, CASE-001, and CASE-002 into a single coordinated threat group.
                </p>

                {/* Conceptual ASCII / Structured Graph Map */}
                <div className="p-4 rounded-lg bg-[#121619] border border-[#242B30] font-mono text-xs space-y-2 text-center sm:text-left">
                  <div className="text-[10px] text-[#5F686E] uppercase">Syndicate Infrastructure Graph:</div>
                  <div className="text-[#F2F2F2] flex flex-col items-center justify-center space-y-2 py-3">
                    <div className="flex items-center space-x-4">
                      <span className="p-2 rounded bg-[#060606] border border-[#81A2A2] text-[#81A2A2] font-bold">CASE-008 (Smishing)</span>
                      <span className="text-[#5F686E]">──────┐</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#B7FF3C]/10 border border-[#B7FF3C]/50 text-[#B7FF3C] font-bold my-2 shadow-lg">
                      SHARED LEAD: +91 9000011111 & invest@upi.test
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="p-2 rounded bg-[#060606] border border-[#81A2A2] text-[#81A2A2] font-bold">CASE-001 (Investment)</span>
                      <span className="text-[#5F686E]">──────┼──────</span>
                      <span className="p-2 rounded bg-[#060606] border border-[#81A2A2] text-[#81A2A2] font-bold">CASE-002 (Phishing)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Conclusion & Recommended Actions */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#060606] border border-[#242B30] space-y-4">
                <div className="flex items-center space-x-2 text-[#B7FF3C]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h4 className="text-sm font-bold text-[#F2F2F2]">
                    Investigation Summary & Actionable Next Steps
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 rounded bg-[#121619] border border-[#242B30]">
                    <div className="text-xl font-bold font-mono text-[#81A2A2]">5</div>
                    <div className="text-[10px] text-[#5F686E]">Entities Extracted</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#121619] border border-[#242B30]">
                    <div className="text-xl font-bold font-mono text-[#B7FF3C]">2</div>
                    <div className="text-[10px] text-[#5F686E]">Linked Cases</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#121619] border border-[#242B30]">
                    <div className="text-xl font-bold font-mono text-[#F5C451]">2</div>
                    <div className="text-[10px] text-[#5F686E]">Cross-Case Leads</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#121619] border border-[#242B30]">
                    <div className="text-xl font-bold font-mono text-[#B7FF3C]">100%</div>
                    <div className="text-[10px] text-[#5F686E]">SHA-256 Provenance</div>
                  </div>
                </div>

                {/* Recommended Investigator Actions */}
                <div className="p-4 rounded-lg bg-[#121619] border border-[#454F56] space-y-2.5">
                  <div className="text-xs font-bold text-[#81A2A2] uppercase tracking-wider font-mono">
                    Recommended Actionable Steps for Officer
                  </div>
                  <ul className="text-xs text-[#F2F2F2] space-y-2 leading-relaxed">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81A2A2] font-bold font-mono">1.</span>
                      <span><strong>Issue Telecom Section 91 Notice:</strong> Request Call Detail Records (CDR) and Subscriber Acquisition Form (CAF) for MSISDN <code className="font-mono text-[#81A2A2] bg-[#060606] px-1 py-0.5 rounded">+91 9000011111</code>.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81A2A2] font-bold font-mono">2.</span>
                      <span><strong>Request Immediate UPI Freeze:</strong> File emergency notice with Payment Service Provider for virtual payment address <code className="font-mono text-[#B7FF3C] bg-[#060606] px-1 py-0.5 rounded">invest@upi.test</code>.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81A2A2] font-bold font-mono">3.</span>
                      <span><strong>Cross-Jurisdiction Case Consolidation:</strong> Merge evidence logs of CASE-008, CASE-001, and CASE-002 under Joint Cyber Crime Command.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 sm:p-5 border-t border-[#242B30] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#060606]/80">
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className="flex items-center space-x-1 px-3 py-2 text-xs text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] rounded border border-[#242B30] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
            <span className="text-xs text-[#5F686E] font-mono">
              Step {currentStep} / {totalSteps}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors shadow-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleRunAndJump('case')}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#B7FF3C] hover:bg-[#B7FF3C]/90 text-[#060606] font-bold text-xs rounded transition-colors shadow-md shadow-[#B7FF3C]/10"
              >
                <span>Open CASE-008 in TRACE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
