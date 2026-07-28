import { nextTick, watch, type Ref } from 'vue'

export type FormIssue = {
  field: string
  message: string
}

type FocusableErrorSummary = {
  focus: () => void
}

export function createFormFieldIds(prefix: string) {
  function fieldId(field: string): string {
    return `${prefix}-${field.split('.').join('-')}`
  }

  function errorId(field: string): string {
    return `${fieldId(field)}-error`
  }

  return { fieldId, errorId }
}

export function issueMessageFor(issues: readonly FormIssue[], field: string): string | undefined {
  return issues.find((issue) => issue.field === field)?.message
}

export function useFormIssueFocus({
  issues,
  errorSummary,
  getFieldId,
}: {
  issues: Ref<readonly FormIssue[]>
  errorSummary: Ref<FocusableErrorSummary | undefined>
  getFieldId: (field: string) => string
}): void {
  watch(issues, async (currentIssues) => {
    if (currentIssues.length === 0) {
      return
    }

    await nextTick()

    if (currentIssues.length === 1) {
      document.getElementById(getFieldId(currentIssues[0]!.field))?.focus()
      return
    }

    errorSummary.value?.focus()
  })
}
