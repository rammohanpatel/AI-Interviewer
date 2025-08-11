import React from 'react'
import { cn,getTechLogos } from '@/lib/utils';
import Image from 'next/image';

const DisplayTechIcons = async({techStack}:TechIconProps) => {
    const techIcons = await getTechLogos(techStack);

    
    return (
    <div className='flex flex-row items-center'>
      {
        techIcons.slice(0,3).map(({tech,url},index)=>(
            <div 
              key={tech}
              className={cn('relative group bg-dark-300 rounded-full p-2 flex flex-center',index>=1 && "-ml-3")}
              >
              <Image 
                src={url}
                alt={tech}
                width={100}
                height={100}
                className="size-5"
            />
            </div>
        ))
      }
      {techIcons.length > 3 && (
        <div className="relative group bg-gray-100 dark:bg-gray-700 rounded-full p-2 flex items-center justify-center -ml-2 min-w-[2rem] h-8">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            +{techIcons.length - 3}
          </span>
          <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:flex px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-900 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
            {techIcons.slice(3).map(({tech}) => tech).join(', ')}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
          </span>
        </div>
      )}
    </div>
  )
}

export default DisplayTechIcons
