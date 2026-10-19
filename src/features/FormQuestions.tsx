import type { FormQuestion } from '../domain'

export type EditorFormQuestion = FormQuestion

const MAX_QUESTIONS = 10

const sanitizeKey = (value: string, fallback: string) => {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
  return !safe || ['__proto__', 'constructor', 'prototype'].includes(safe) ? fallback : safe
}

const uniqueKey = (value: string, questions: EditorFormQuestion[], currentIndex = -1) => {
  const used = new Set(
    questions
      .map((question, index) => (index === currentIndex ? '' : question.key))
      .filter(Boolean),
  )
  const base = sanitizeKey(value, `question-${questions.length + 1}`)
  if (!used.has(base)) return base
  for (let index = 2; index <= MAX_QUESTIONS + 1; index += 1) {
    const next = `${base.slice(0, 97)}-${index}`
    if (!used.has(next)) return next
  }
  return base
}

export function normalizeFormQuestions(
  questions: FormQuestion[] | undefined,
  maxQuestions = MAX_QUESTIONS,
) {
  const normalized: EditorFormQuestion[] = []
  for (const [index, question] of (questions ?? []).slice(0, maxQuestions).entries()) {
    normalized.push({
      key: uniqueKey(question.key || `question-${index + 1}`, normalized),
      label: question.label.slice(0, 200),
      required: !!question.required,
    })
  }
  return normalized
}

export function FormQuestions({
  questions,
  onChange,
  maxQuestions = MAX_QUESTIONS,
}: {
  questions?: FormQuestion[]
  onChange: (questions: EditorFormQuestion[]) => void
  maxQuestions?: number
}) {
  const safeQuestions = normalizeFormQuestions(questions, maxQuestions)
  const addDisabled = safeQuestions.length >= maxQuestions

  const commit = (next: EditorFormQuestion[]) =>
    onChange(normalizeFormQuestions(next, maxQuestions))
  const addQuestion = () => {
    if (addDisabled) return
    const number = safeQuestions.length + 1
    commit([
      ...safeQuestions,
      {
        key: uniqueKey(`question-${number}`, safeQuestions),
        label: `Câu hỏi ${number}`,
        required: false,
      },
    ])
  }
  const updateQuestion = (index: number, patch: Partial<FormQuestion>) => {
    commit(
      safeQuestions.map((question, questionIndex) => {
        if (questionIndex !== index) return question
        return {
          ...question,
          ...patch,
          key: patch.key ? uniqueKey(patch.key, safeQuestions, index) : question.key,
        }
      }),
    )
  }
  const removeQuestion = (index: number) =>
    commit(safeQuestions.filter((_, questionIndex) => questionIndex !== index))

  return (
    <section className="form-questions" aria-labelledby="form-questions-title">
      <div className="form-questions-heading">
        <div>
          <h4 id="form-questions-title">Câu hỏi tùy chỉnh</h4>
          <p>Họ tên và số điện thoại mặc định luôn được giữ trong preview Zalo Form.</p>
        </div>
        <button type="button" className="text-button" disabled={addDisabled} onClick={addQuestion}>
          + Thêm câu hỏi
        </button>
      </div>
      {safeQuestions.length === 0 ? (
        <p className="form-questions-empty">
          Chưa có câu hỏi tùy chỉnh. Form vẫn hiện họ tên và số điện thoại.
        </p>
      ) : (
        <div className="form-question-list">
          {safeQuestions.map((question, index) => (
            <fieldset className="form-question-card" key={index}>
              <legend>Câu hỏi {index + 1}</legend>
              <div className="form-question-grid">
                <label htmlFor={`form-question-${index}-label`}>
                  Nhãn câu hỏi
                  <input
                    id={`form-question-${index}-label`}
                    maxLength={200}
                    value={question.label}
                    onChange={(event) => updateQuestion(index, { label: event.target.value })}
                  />
                </label>
                <label htmlFor={`form-question-${index}-key`}>
                  Key
                  <input
                    id={`form-question-${index}-key`}
                    maxLength={100}
                    value={question.key}
                    onChange={(event) => updateQuestion(index, { key: event.target.value })}
                  />
                </label>
                <label className="checkbox-label" htmlFor={`form-question-${index}-required`}>
                  <input
                    id={`form-question-${index}-required`}
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) => updateQuestion(index, { required: event.target.checked })}
                  />
                  Bắt buộc
                </label>
              </div>
              <button
                type="button"
                className="text-button danger"
                onClick={() => removeQuestion(index)}
              >
                Xóa câu hỏi
              </button>
            </fieldset>
          ))}
        </div>
      )}
      <small>
        {safeQuestions.length} / {maxQuestions} câu hỏi tùy chỉnh.
      </small>
    </section>
  )
}
