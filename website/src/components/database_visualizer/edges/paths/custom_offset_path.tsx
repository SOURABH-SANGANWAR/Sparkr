
export const calculatePath = ({sourceX, sourceY, targetX, targetY, offset = 100, initialRightOffset = 15}:
    {sourceX: number, sourceY: number, targetX: number, targetY: number, offset?: number, initialRightOffset?: number}
) => {
    // Calculate point after initial right offset
    const point1X = sourceX + initialRightOffset;
    const point1Y = sourceY;
  
    // Calculate point after down + offset
    const point2X = point1X;
    const point2Y = point1Y + offset;

    const point3X = targetX - initialRightOffset;
    const point3Y = point2Y;
  
    // Calculate final point with adjusted target position
    const finalPointX = targetX - initialRightOffset; // Right 15px from target
    const finalPointY = targetY; // Up to target
  
    // Label position (can be adjusted based on your needs)
    const labelX = point2X + (finalPointX - point2X) / 2;
    const labelY = point2Y ; // Adjust vertical offset for label
  
    // Create SVG path segments
    const pathSegment1 = `M ${sourceX},${sourceY} L ${point1X},${point1Y}`;
    const pathSegment2 = `L ${point2X},${point2Y}`;
    const pathSegment3 = `L ${point3X},${point3Y}`;
    const pathSegment4 = `L ${finalPointX},${finalPointY}`;
    const pathSegment5 = `L ${targetX},${targetY}`;
  
    // Combine path segments
    const edgePath = `${pathSegment1} ${pathSegment2} ${pathSegment3} ${pathSegment4} ${pathSegment5}`;
  
    return [edgePath, labelX, labelY] ;
  };
  