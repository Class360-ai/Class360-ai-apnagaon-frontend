import React from "react";

const Skeleton = ({ width = "w-full", height = "h-4", count = 1 }) => {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse`}
        />
      ))}
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <Skeleton width="w-full" height="h-40" />
      <div className="p-3">
        <Skeleton height="h-4" />
        <Skeleton height="h-3" count={2} />
        <Skeleton width="w-1/2" height="h-5" />
      </div>
    </div>
  );
};

export default Skeleton;
