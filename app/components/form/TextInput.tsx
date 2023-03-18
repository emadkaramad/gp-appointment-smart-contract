interface Props {
  label: string
  value?: string
  onValueChange: (value: string) => void
}

const TextInput: React.FC<Props> = ({ label, value, onValueChange }) => (
  <div>
    <label>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  </div>
)

export default TextInput
