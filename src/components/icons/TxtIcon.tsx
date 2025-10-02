interface TxtIconProps {
  className?: string;
}

export const TxtIcon = ({ className = "" }: TxtIconProps) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
      fill="#6b7280"
      fillOpacity="0.1"
    />
    <path d="M14 2L20 8H14V2Z" fill="#6b7280" fillOpacity="0.3" />

    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="#6b7280"
      fontSize="5"
      fontWeight="bold"
    >
      TXT
    </text>
  </svg>
);
