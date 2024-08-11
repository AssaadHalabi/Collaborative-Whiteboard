import Image from "next/image";

const Loader = ({
  width = 100,
  height = 100,
}: {
  width?: `${number}` | number;
  height?: `${number}` | number;
}) => (
  <div className='flex h-screen w-screen flex-col items-center justify-center gap-2'>
    <Image
      src='/assets/loader.gif'
      alt='loader'
      width={width}
      height={height}
      className='object-contain'
    />
    <p className='text-sm font-bold text-primary-grey-300'>Loading...</p>
  </div>
);

export default Loader;
