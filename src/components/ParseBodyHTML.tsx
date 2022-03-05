
import { useEffect,useState } from 'react';

const ParseBodyHTML = ({html, small=true, limitWidth=false}) => {
const [insertHTML, setInsertHTML] = useState("");
useEffect(() => {

  //formatting per Teddit
  const unescape = (s) => {
    if(s) {
      var re = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
      var unescaped = {
        '&amp;': '&',
        '&#38;': '&',
        '&lt;': '<',
        '&#60;': '<',
        '&gt;': '>',
        '&#62;': '>',
        '&apos;': "'",
        '&#39;': "'",
        '&quot;': '"',
        '&#34;': '"'
      }
      let result = s.replace(re, (m) => {
        return unescaped[m]
      })
      
      result = replaceDomains(result)
      
      return result
    } else {
      return ''
    }
  }

  const replaceDomains = (str) => {
    if(typeof(str) == 'undefined' || !str)
      return
    return replaceUserDomains(str)
  }

  const replaceUserDomains = (str) => {
    
    let redditRegex = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))/gm;
    // let youtubeRegex = /([A-z.]+\.)?youtu(be\.com|\.be)/gm;
    // let twitterRegex = /([A-z.]+\.)?twitter\.com/gm;
    // let instagramRegex = /([A-z.]+\.)?instagram.com/gm;
    
    str = str.replace(redditRegex, 'troddit.com')
  
    return str
  }

let unescaped = unescape(html);
//let unescapedHTML = splitSpans(unescaped);
//console.log(unescaped);
setInsertHTML(unescaped);
  
}, [html])
  

  return (
    <div
    className={"dark:prose-invert prose   " + (small ? " prose-sm  prose-p:my-0" : " prose-md ") + (limitWidth ? " max-w-2xl " : " max-w-5xl")}
    id="innerhtml"
    dangerouslySetInnerHTML={{ __html: insertHTML }}
  ></div>  )
}

export default ParseBodyHTML