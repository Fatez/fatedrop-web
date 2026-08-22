import { readFileSync, writeFileSync } from 'node:fs';

// Deterministic retry-safe patch for the isolated Oru & Friends branch.
const path = 'components/companion-renderer.tsx';
let source = readFileSync(path, 'utf8');

source = source.replace('  type CompanionReaction,\n', '');

source = source.replace(
  '  const runtimeRef = useRef<Runtime | null>(null);\n  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");',
  '  const runtimeRef = useRef<Runtime | null>(null);\n  const reactionRef = useRef(request.reaction);\n  reactionRef.current = request.reaction;\n  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");',
);

source = source.replace(
  '    setStatus("loading");\n    setError(null);\n    runtimeRef.current = null;',
  '    queueMicrotask(() => {\n      if (cancelled) return;\n      setStatus("loading");\n      setError(null);\n    });\n    runtimeRef.current = null;',
);

source = source.replace(
  '    } catch (cause) {\n      setStatus("error");\n      setError(cause instanceof Error ? cause.message : "WebGL is unavailable on this device.");\n      return;\n    }',
  '    } catch (cause) {\n      const message = cause instanceof Error ? cause.message : "WebGL is unavailable on this device.";\n      queueMicrotask(() => {\n        if (cancelled) return;\n        setError(message);\n        setStatus("error");\n      });\n      return;\n    }',
);

source = source.replace(
  '      playRuntimeClip(runtime, definition.animationClips[request.reaction]);',
  '      playRuntimeClip(runtime, definition.animationClips[reactionRef.current]);',
);

source = source.replace(
  '  }, [definition.id, definition.modelUrl, definition.name, definition.textureUrl]);',
  '  }, [definition.animationClips, definition.id, definition.modelUrl, definition.name, definition.textureUrl]);',
);

if (source.includes('type CompanionReaction,')) throw new Error('Unused CompanionReaction import survived patch.');
if (source.includes('definition.animationClips[request.reaction]')) throw new Error('Initial load still closes over request.reaction.');
if (!source.includes('reactionRef.current = request.reaction')) throw new Error('Reaction ref was not installed.');
if (!source.includes('[definition.animationClips, definition.id')) throw new Error('Hook dependency patch was not installed.');

writeFileSync(path, source);
console.log('Oru renderer hook/lint patch applied.');
