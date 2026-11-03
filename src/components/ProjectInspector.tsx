import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  Check,
  FileText,
  Layers,
  Cpu,
  GitBranch,
  ShieldCheck,
  FolderTree,
  ExternalLink
} from 'lucide-react';
import {
  GITHUB_WORKFLOW_CONTENT,
  ROOT_BUILD_GRADLE,
  SETTINGS_GRADLE,
  APP_BUILD_GRADLE,
  ANDROID_MANIFEST,
  README_MD,
  downloadAndroidProjectZip
} from '../data/androidProjectFiles';

interface ProjectInspectorProps {
  mainActivityCode: string;
  onClose: () => void;
}

export const ProjectInspector: React.FC<ProjectInspectorProps> = ({
  mainActivityCode,
  onClose
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('main_activity');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const files = [
    {
      id: 'main_activity',
      name: 'MainActivity.kt',
      path: 'app/src/main/java/tv/sambhav/os/launcher/MainActivity.kt',
      category: 'Kotlin Views Architecture',
      badge: '1,166 Lines',
      language: 'kotlin',
      content: mainActivityCode
    },
    {
      id: 'github_action',
      name: 'build.yml',
      path: '.github/workflows/build.yml',
      category: 'CI/CD Pipeline',
      badge: 'JDK 17 + Gradle 8.9',
      language: 'yaml',
      content: GITHUB_WORKFLOW_CONTENT
    },
    {
      id: 'manifest',
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      category: 'TV Configuration',
      badge: 'LEANBACK_LAUNCHER',
      language: 'xml',
      content: ANDROID_MANIFEST
    },
    {
      id: 'app_gradle',
      name: 'build.gradle (app)',
      path: 'app/build.gradle',
      category: 'Build Configuration',
      badge: 'AGP 8.7.3 / SDK 28',
      language: 'gradle',
      content: APP_BUILD_GRADLE
    },
    {
      id: 'root_gradle',
      name: 'build.gradle (root)',
      path: 'build.gradle',
      category: 'Build Configuration',
      badge: 'Kotlin 2.0.21',
      language: 'gradle',
      content: ROOT_BUILD_GRADLE
    },
    {
      id: 'settings_gradle',
      name: 'settings.gradle',
      path: 'settings.gradle',
      category: 'Build Configuration',
      badge: 'Repositories',
      language: 'gradle',
      content: SETTINGS_GRADLE
    },
    {
      id: 'readme',
      name: 'README.md',
      path: 'README.md',
      category: 'Documentation',
      badge: 'TCL Android 9 Guide',
      language: 'markdown',
      content: README_MD
    }
  ];

  const currentFile = files.find((f) => f.id === selectedFileId) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip(mainActivityCode);
    } catch (err) {
      console.error('Failed to create zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-3xl flex flex-col p-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/30 border border-sky-400/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              <span>Sambhav TV OS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-medium">
                Native Android 9 (API 28)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Full production source files ready for GitHub repository &amp; automated APK compilation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-zinc-950" />
            <span>{isZipping ? 'Generating ZIP...' : 'Download Project (.ZIP)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-panel text-zinc-300 hover:text-white font-medium text-xs tracking-wider transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          >
            Return to TV Experience
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar File Tree & Code Viewer */}
      <div className="flex-1 flex gap-5 mt-4 overflow-hidden">
        {/* Left Sidebar: File Directory */}
        <div className="w-80 glass-panel rounded-2xl p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            <FolderTree className="w-4 h-4 text-sky-400" />
            <span>Project Explorer</span>
          </div>

          <div className="space-y-1.5 flex-1">
            {files.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-white/15 border border-white/30 shadow-md text-white'
                      : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-mono tracking-tight">{file.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-sans">
                      {file.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* GitHub Actions Instructions Box */}
          <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Automated GitHub Build</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Push to GitHub &rarr; GitHub Actions builds with JDK 17 &amp; Gradle 8.9 &rarr; Download{' '}
              <code className="text-sky-300">app-debug.apk</code> from Actions tab!
            </p>
          </div>
        </div>

        {/* Right Pane: Code Preview */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          {/* File Tab Info */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
              <Code className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">{currentFile.path}</span>
              <span className="text-zinc-400">({currentFile.content.split('\n').length} lines)</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg glass-panel hover:bg-white/15 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Text Content */}
          <div className="flex-1 overflow-auto p-5 bg-[#080b11] font-mono text-xs leading-relaxed text-zinc-300 select-text">
            <pre className="overflow-x-auto">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
