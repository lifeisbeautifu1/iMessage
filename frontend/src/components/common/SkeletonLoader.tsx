import { Skeleton } from "@chakra-ui/react";

type Props = {
  count: number;
  height: string;
};

const SkeletonLoader = ({ count, height }: Props) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          startColor="blackAlpha.400"
          endColor="whiteAlpha.300"
          height={height}
          width={{ base: "100%" }}
          borderRadius={4}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
