const SubMultiButton = ({subreddits}) => {
  return (
    <div>
      <div>
      <div className="relative select-none">
        <div
          className={
              "w-24 text-center flex justify-center items-center dark:border border-2 dark:border-lightBorder  rounded-md cursor-pointer dark:hover:bg-darkBorder hover:bg-lightHighlight group"
          }
        >
         <div
              onClick={(e) => {
                e.preventDefault();
              }}
              className="flex items-center p-1 space-x-1"
            >
              <span>Multi</span>
            </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SubMultiButton
