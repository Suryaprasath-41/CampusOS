'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Search, Database, CheckCircle2, Clock, AlertCircle,
  File, FileSpreadsheet, Trash2, Eye, RefreshCw, Sparkles, ArrowUpRight,
  BarChart3, Layers, Zap, ChevronRight, Loader2, X, FileUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';
import WidgetCard, { GlassCard, SectionTitle, PredictionBar } from './WidgetCard';

// ─── Types ───────────────────────────────────────────────────────────
type DocStatus = 'Indexed' | 'Indexing' | 'Failed';
type DocType = 'PDF' | 'DOCX' | 'TXT' | 'CSV';

interface KBDocument {
  id: string;
  title: string;
  type: DocType;
  size: string;
  uploadDate: string;
  status: DocStatus;
  chunks: number;
  relevance?: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────
const mockDocuments: KBDocument[] = [
  { id: '1', title: 'University Handbook 2024', type: 'PDF', size: '4.2 MB', uploadDate: '2025-02-15', status: 'Indexed', chunks: 342 },
  { id: '2', title: 'CS Syllabus - Semester 1-8', type: 'PDF', size: '1.8 MB', uploadDate: '2025-02-20', status: 'Indexed', chunks: 187 },
  { id: '3', title: 'Placement Policy Document', type: 'DOCX', size: '890 KB', uploadDate: '2025-02-22', status: 'Indexed', chunks: 94 },
  { id: '4', title: 'Fee Structure & Scholarship Rules', type: 'PDF', size: '2.1 MB', uploadDate: '2025-03-01', status: 'Indexed', chunks: 156 },
  { id: '5', title: 'Hostel Regulations 2024-25', type: 'PDF', size: '1.5 MB', uploadDate: '2025-03-02', status: 'Indexing', chunks: 0 },
  { id: '6', title: 'Exam Schedule Template', type: 'CSV', size: '340 KB', uploadDate: '2025-03-03', status: 'Indexed', chunks: 28 },
  { id: '7', title: 'Student Code of Conduct', type: 'TXT', size: '120 KB', uploadDate: '2025-03-03', status: 'Failed', chunks: 0 },
  { id: '8', title: 'IT Department Lab Manual', type: 'PDF', size: '3.7 MB', uploadDate: '2025-03-04', status: 'Indexed', chunks: 267 },
  { id: '9', title: 'Research Publication Guidelines', type: 'DOCX', size: '560 KB', uploadDate: '2025-03-04', status: 'Indexed', chunks: 45 },
  { id: '10', title: 'Library Catalog Supplement', type: 'PDF', size: '8.9 MB', uploadDate: '2025-03-05', status: 'Indexing', chunks: 0 },
];

const pipelineStages = [
  { label: 'Extracting', icon: FileText, color: 'purple' },
  { label: 'Chunking', icon: Layers, color: 'cyan' },
  { label: 'Embedding', icon: Sparkles, color: 'green' },
  { label: 'Indexed', icon: CheckCircle2, color: 'emerald' },
];

// ─── Main Component ──────────────────────────────────────────────────
export default function AdminKnowledgeBase() {
  const [documents, setDocuments] = useState<KBDocument[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [searchResults, setSearchResults] = useState<{ text: string; source: string; score: number }[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const indexedDocs = documents.filter(d => d.status === 'Indexed');
  const totalChunks = indexedDocs.reduce((sum, d) => sum + d.chunks, 0);
  const avgRelevance = 87.3;
  const lastIndexed = '5 min ago';

  const stats = [
    { label: 'Total Documents', value: documents.length, icon: FileText, color: 'purple', gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10 border-purple-500/20', textColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Chunks', value: totalChunks, icon: Layers, color: 'cyan', gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/10 border-cyan-500/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Avg Relevance', value: avgRelevance, decimals: 1, suffix: '%', icon: BarChart3, color: 'green', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10 border-green-500/20', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Last Indexed', value: 0, displayValue: lastIndexed, icon: Clock, color: 'orange', gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10 border-orange-500/20', textColor: 'text-orange-600 dark:text-orange-400' },
  ];

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const newDoc: KBDocument = {
            id: String(documents.length + 1),
            title: 'New Uploaded Document.pdf',
            type: 'PDF',
            size: '2.4 MB',
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'Indexing',
            chunks: 0,
          };
          setDocuments(prev => [newDoc, ...prev]);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const runPipeline = () => {
    setPipelineActive(true);
    setPipelineStage(0);
    const interval = setInterval(() => {
      setPipelineStage(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setTimeout(() => setPipelineActive(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setShowSearch(true);
    setSearchResults([
      { text: 'Students must maintain a minimum of 75% attendance to be eligible for semester examinations...', source: 'University Handbook 2024', score: 94.2 },
      { text: 'The placement cell coordinates with industry partners to facilitate campus recruitment drives...', source: 'Placement Policy Document', score: 91.8 },
      { text: 'CS301 Data Structures requires prerequisite completion of CS201 Object Oriented Programming...', source: 'CS Syllabus - Semester 1-8', score: 88.5 },
      { text: 'Merit-based scholarships are awarded to the top 10% of students in each department...', source: 'Fee Structure & Scholarship Rules', score: 85.1 },
      { text: 'The central library houses over 54,000 volumes across engineering and science disciplines...', source: 'Library Catalog Supplement', score: 82.7 },
    ]);
  };

  const getFileIcon = (type: DocType) => {
    switch (type) {
      case 'PDF': return <File className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'DOCX': return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'TXT': return <FileText className="w-5 h-5 text-[var(--text-secondary)]" />;
      case 'CSV': return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getStatusBadge = (status: DocStatus) => {
    const config = {
      Indexed: { bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', icon: CheckCircle2 },
      Indexing: { bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', icon: Loader2 },
      Failed: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: AlertCircle },
    };
    const c = config[status];
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium", c.bg)}>
        <c.icon className={cn("w-3 h-3", status === 'Indexing' && 'animate-spin')} />
        {status}
      </span>
    );
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "bg-[var(--glass-bg)] backdrop-blur-xl border rounded-2xl p-4",
              "hover:border-[var(--border-color)] transition-all duration-300",
              stat.bg
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("w-5 h-5", stat.textColor)} />
              <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)]" />
            </div>
            <div className={cn("text-2xl font-bold", stat.textColor)}>
              {stat.displayValue || <AnimatedCounter value={stat.value} decimals={stat.decimals || 0} suffix={stat.suffix || ''} />}
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Upload Area + Pipeline + Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Drag & Drop Upload */}
        <GlassCard className="relative">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Upload Documents
          </h3>
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={handleUpload}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
              isUploading
                ? "border-purple-500/40 bg-purple-500/5"
                : "border-[var(--border-color)] hover:border-purple-500/30 hover:bg-[var(--glass-bg)]"
            )}
          >
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto" />
                <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
                <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)]">{uploadProgress}%</p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUp className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                <p className="text-sm text-[var(--text-secondary)]">Drag & drop files here</p>
                <p className="text-xs text-[var(--text-muted)]">or click to browse</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {['PDF', 'DOCX', 'TXT', 'CSV'].map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </GlassCard>

        {/* RAG Pipeline Status */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> RAG Pipeline
          </h3>
          <div className="space-y-3">
            {pipelineStages.map((stage, i) => {
              const isActive = pipelineActive && i <= pipelineStage;
              const isComplete = pipelineActive && i < pipelineStage;
              const isCurrent = pipelineActive && i === pipelineStage;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                      isComplete ? `bg-${stage.color}-500/20 border-${stage.color}-500/30` :
                      isCurrent ? `bg-${stage.color}-500/20 border-${stage.color}-500/30 animate-pulse` :
                      "bg-[var(--glass-bg)] border-[var(--border-color)]"
                    )}
                    style={isActive ? {
                      backgroundColor: isComplete || isCurrent ? `rgba(${stage.color === 'purple' ? '139,92,246' : stage.color === 'cyan' ? '6,182,212' : stage.color === 'green' ? '34,197,94' : '16,185,129'},0.15)` : undefined,
                      borderColor: isComplete || isCurrent ? `rgba(${stage.color === 'purple' ? '139,92,246' : stage.color === 'cyan' ? '6,182,212' : stage.color === 'green' ? '34,197,94' : '16,185,129'},0.3)` : undefined,
                    } : {}}
                  >
                    <stage.icon className={cn(
                      "w-4 h-4",
                      isComplete || isCurrent ? (stage.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : stage.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' : stage.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-400') : "text-[var(--text-muted)]"
                    )} />
                  </motion.div>
                  <div className="flex-1">
                    <div className={cn(
                      "text-sm font-medium",
                      isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                    )}>
                      {stage.label}
                    </div>
                    <div className="h-1.5 mt-1 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                      {(isComplete || isCurrent) && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isComplete ? '100%' : '60%' }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn(
                            "h-full rounded-full",
                            stage.color === 'purple' ? 'bg-purple-500' :
                            stage.color === 'cyan' ? 'bg-cyan-500' :
                            stage.color === 'green' ? 'bg-green-500' : 'bg-emerald-500'
                          )}
                        />
                      )}
                    </div>
                  </div>
                  {isComplete && <CheckCircle2 className={cn("w-4 h-4", stage.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : stage.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' : 'text-green-600 dark:text-green-400')} />}
                  {isCurrent && <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />}
                </div>
              );
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runPipeline}
            disabled={pipelineActive}
            className={cn(
              "w-full mt-4 py-2 rounded-xl text-sm font-medium transition-colors",
              pipelineActive
                ? "bg-[var(--glass-bg)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20"
            )}
          >
            {pipelineActive ? 'Processing...' : 'Run Pipeline'}
          </motion.button>
        </GlassCard>

        {/* Search Preview */}
        <GlassCard>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-green-600 dark:text-green-400" /> Search Preview
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Test search across documents..."
              className="flex-1 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-green-500/40 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
            >
              <Search className="w-4 h-4" />
            </motion.button>
          </div>
          {showSearch ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)]"
                >
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{result.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--text-muted)]">{result.source}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      result.score >= 90 ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" :
                      result.score >= 80 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20" :
                      "bg-gray-500/10 text-[var(--text-secondary)] border border-gray-500/20"
                    )}>
                      {result.score}% match
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Database className="w-8 h-8 text-[var(--text-muted)] mb-2" />
              <p className="text-xs text-[var(--text-muted)]">Search across {indexedDocs.length} indexed documents</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">RAG-powered semantic search</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Document Library */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Document Library
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {documents.length} docs
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-500/40 w-48 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filteredDocs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] hover:border-[var(--border-color)] transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(doc.type)}
                    <div>
                      <h4 className="text-sm text-[var(--text-primary)] font-medium line-clamp-1 group-hover:text-purple-600 dark:text-purple-400 transition-colors">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--glass-bg)] text-[var(--text-muted)] font-mono">
                          {doc.type}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="p-1 rounded hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-red-600 dark:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {getStatusBadge(doc.status)}
                  {doc.chunks > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)]">{doc.chunks} chunks</span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-2">
                  Uploaded {doc.uploadDate}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No documents found</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
