export default function IconButton({
  title,
  icon,
  onClick,
  colorName,
  outline,
}) {
  const COLORS = {
    red: { text: `text-red-500`, bg: `bg-red-500` },
    blue: { text: `text-sky-500`, bg: `bg-sky-500` },
    green: { text: `text-green-700`, bg: `bg-green-500` },
  };

  const foundColor = COLORS[colorName] || COLORS["blue"];

  const hoverStyle = outline
    ? `hover:outline outline-1`
    : `  hover:${foundColor.bg} hover:text-white`;

  return (
    <div
      className={` 

w-full

md:w-fit

      ${foundColor.text} 
      ${hoverStyle}
      flex gap-2 items-center  p-1 rounded-md w-fit cursor-pointer `}
      /* onClick={(e) => setCurrentSection(SECTIONS[1]) */
      onClick={onClick}
    >
      <img src={icon} width={22} />
      <span>{title}</span>
    </div>
  );
}
