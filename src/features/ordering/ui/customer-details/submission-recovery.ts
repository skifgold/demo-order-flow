export type SubmissionRecovery =
  | { kind: 'conflict' }
  | { kind: 'network' }
  | { kind: 'system' }
  | { kind: 'validation' }

export function submissionRecoveryHeading(recovery: SubmissionRecovery): string {
  return recovery.kind === 'conflict'
    ? 'An item in your basket changed'
    : 'We couldn’t place your order'
}

export function submissionRecoverySeverity(recovery: SubmissionRecovery): 'warn' | 'error' {
  return recovery.kind === 'conflict' ? 'warn' : 'error'
}

export function submissionRecoveryMessage(
  recovery: SubmissionRecovery,
  affectedArtworkNames: readonly string[] = [],
): string {
  switch (recovery.kind) {
    case 'conflict':
      return conflictRecoveryMessage(affectedArtworkNames)
    case 'network':
      return 'We could not reach the order service. Your details are still here, so please try again.'
    case 'system':
      return 'We could not place your order. Your details are still here, so please try again.'
    case 'validation':
      return 'We could not apply one or more order checks. Review your details and try again.'
  }
}

function conflictRecoveryMessage(affectedArtworkNames: readonly string[]): string {
  if (affectedArtworkNames.length === 1) {
    return `${affectedArtworkNames[0]} may have changed availability or price. Review your basket before placing the order.`
  }

  return 'An item in your basket may have changed availability or price. Review your basket before placing the order.'
}
