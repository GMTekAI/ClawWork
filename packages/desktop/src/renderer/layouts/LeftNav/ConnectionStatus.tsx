import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Status = 'connected' | 'connecting' | 'disconnected'

interface MergedConfig {
  color: string
  label: string
  hint?: string
  pulse?: boolean
}

interface ConnectionStatusProps {
  gatewayStatus: Status
  pluginStatus: Status
  className?: string
}

function computeMerged(plugin: Status, gateway: Status): MergedConfig {
  if (plugin === 'disconnected') {
    return { color: 'bg-[var(--danger)]', label: '不可用', hint: 'Plugin 断开' }
  }
  if (plugin === 'connecting') {
    return { color: 'bg-[var(--warning)]', label: '连接中…', hint: 'Plugin 连接中', pulse: true }
  }
  if (gateway === 'connected') {
    return { color: 'bg-[var(--accent)]', label: '已连接' }
  }
  return { color: 'bg-[var(--warning)]', label: '部分连接', hint: 'Gateway 断开' }
}

export default function ConnectionStatus({ gatewayStatus, pluginStatus, className }: ConnectionStatusProps) {
  const cfg = computeMerged(pluginStatus, gatewayStatus)
  const key = `${pluginStatus}-${gatewayStatus}`

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={cn('flex items-center gap-2 px-3 py-1.5 text-xs', className)}
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            cfg.color,
            cfg.pulse && 'animate-pulse',
          )}
        />
        <span className="text-[var(--text-muted)]">
          {cfg.label}
          {cfg.hint && (
            <span className="ml-1 text-[var(--text-muted)] opacity-60">({cfg.hint})</span>
          )}
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
