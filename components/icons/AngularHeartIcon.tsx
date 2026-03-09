import React from 'react';

export const AngularHeartIcon = ({
	size = 24,
	className = '',
	fill = 'none',
	stroke = 'currentColor',
	strokeWidth = 2,
	...props
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={fill}
			stroke={stroke}
			strokeWidth={strokeWidth}
			strokeLinecap="square"
			strokeLinejoin="miter"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M12 21L4 13V7L7 4H10L12 6L14 4H17L20 7V13L12 21Z" />
		</svg>
	);
};
