const HoverCard = ({ children, className, ...rest }) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700
        hover:border-blue-500 hover:shadow-xl 
        transition-all duration-300 ease-in-out
        ${className}
      `}
      {...rest} // 
    >
      {children}
    </div>
  );
};

export default HoverCard;