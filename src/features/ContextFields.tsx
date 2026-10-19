import type { CampaignContext } from '../domain'

export function ContextFields({ value, onChange }: {
  value?: CampaignContext
  onChange: (value: CampaignContext) => void
}) {
  const context = value ?? { market: 'Vietnam', objective: 'unknown', accountCondition: 'not_connected' }
  return <details className="context-fields">
    <summary>Điều kiện chiến dịch <span>{context.market || 'Chưa chọn thị trường'} · Chưa kết nối tài khoản</span></summary>
    <div className="context-fields-grid">
      <label>Mục tiêu
        <select aria-label="Mục tiêu chiến dịch" value={context.objective ?? 'unknown'} onChange={(event) => onChange({ ...context, objective: event.target.value as CampaignContext['objective'] })}>
          <option value="unknown">Chưa chọn</option>
          <option value="awareness">Nhận diện</option><option value="traffic">Lưu lượng</option>
          <option value="leads">Lead</option><option value="sales">Doanh số</option><option value="engagement">Tương tác</option>
        </select>
      </label>
      <label>Loại chiến dịch<input aria-label="Loại chiến dịch" value={context.campaignType ?? ''} maxLength={200} placeholder="Tùy chọn" onChange={(event) => onChange({ ...context, campaignType: event.target.value })} /></label>
      <label>Thị trường<input aria-label="Thị trường" value={context.market} maxLength={200} onChange={(event) => onChange({ ...context, market: event.target.value })} /></label>
      <label>Điều kiện tài khoản<input aria-label="Điều kiện tài khoản" value={context.accountCondition === 'not_connected' ? '' : context.accountCondition ?? ''} maxLength={200} placeholder="Chưa kết nối tài khoản" onChange={(event) => onChange({ ...context, accountCondition: event.target.value || 'not_connected' })} /></label>
    </div>
    <p>Điều kiện phân phối cần đối chiếu trong tài khoản nền tảng. Spec creative không xác nhận quyền phân phối.</p>
  </details>
}
