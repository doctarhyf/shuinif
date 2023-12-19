import ld from "../assets/icons/loading.png";

export default function ProgressView({ loading }) {
  return (
    <div
      className={` flex justify-center py-1 ${
        loading ? "visible" : "invisible"
      } `}
    >
      <img src={ld} className=" animate-spin " width={20} />
    </div>
  );
}
