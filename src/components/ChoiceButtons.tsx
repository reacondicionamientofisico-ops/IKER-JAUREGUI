interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** Selección única con botones. Volver a pulsar la opción activa la desmarca. */
export default function ChoiceButtons({ label, options, value, onChange }: Props) {
  return (
    <div className="choice-group" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`choice-btn${value === o ? " selected" : ""}`}
          aria-pressed={value === o}
          onClick={() => onChange(value === o ? "" : o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
