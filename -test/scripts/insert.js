const pageBody = $("body")[0];
const pageHead = $("head")[0];
let   pageMain;// = $("main")[0];

pageBody.style.opacity = "0.0";

const isDocumentReady = new Promise((resolve, reject) => 
{
    setTimeout(() => 
    {
        try 
        {
            resolve(document.readyState == "complete");
        }
        catch (e)
        {
            reject("ERROR: " + e);
            console.error("FAILED TO DISPLAY UI: " + e);
        }
    } , 1000);
} ) ;

let layoutData;     let headerData;     let navData;    let footerData;
let layoutHtml;     let headerHtml;     let navHtml;    let footerHtml;

let commonCssData;     let commonCssText;
let articleLayoutData; let articleLayoutHtml;



async function GatherResources (isCustomPage)
{
    console.time("__TOTAL_TIME_");
    console.time("_getHtmlData");

    IsLayoutCodeCached();
    switch (layoutCached)
    {
        case true:
            layoutHtml = localStorage.getItem("layoutHtml");
            headerHtml = localStorage.getItem("headerHtml");
            navHtml    = localStorage.getItem("navHtml");
            footerHtml = localStorage.getItem("footerHtml");
            
            commonCssText = localStorage.getItem("commonCSS");
            articleLayoutHtml = localStorage.getItem("articleLayoutHtml");
        break;

        case false:
            console.log("Layout code isn't chached. Downloading it from the server.");
            
            const ovrlData = await fetch("./overlay.html");
            const ovrText  = await ovrlData.text();
            
            pageBody.insertAdjacentHTML("afterend",ovrText);
            
            layoutData = await fetch("/-test/base.html");
            headerData = await fetch("/assets/parts/header.html");
            navData    = await fetch("/assets/parts/nav.html"); 
            footerData = await fetch("/assets/parts/footer.html");
            
            layoutHtml = await layoutData.text();
            headerHtml = await headerData.text();
            navHtml    = await navData.text();
            footerHtml = await footerData.text();
            
            commonCssData     = await fetch("/-test/commonStyles.html");
            articleLayoutData = await fetch("/-test/articleLayout.html");
            commonCssText     = await commonCssData.text();
            articleLayoutHtml = await articleLayoutData.text();
            

            localStorage.setItem("layoutHtml",layoutHtml);
            localStorage.setItem("headerHtml",headerHtml);
            localStorage.setItem("navHtml"   ,navHtml);
            localStorage.setItem("footerHtml",footerHtml);

            localStorage.setItem("commonCSS",commonCssText);
            localStorage.setItem("articleLayoutHtml",articleLayoutHtml);
        break;
    }
    console.timeEnd("_getHtmlData");
    InsertStuff(isCustomPage);
}

let layoutCached = false;
function IsLayoutCodeCached ()
{
    if (localStorage.getItem("layoutHtml") == null || localStorage.getItem("headerHtml") == null || localStorage.getItem("navHtml") == null ||
        localStorage.getItem("footerHtml") == null || localStorage.getItem("articleLayoutHtml") == null || localStorage.getItem("commonCSS") == null ) 
    {
        // return false
        layoutCached = false;
    }
    else 
    {
        // return true;
        layoutCached = true;
    }
}

async function InsertStuff (isCustomPage)
{
    console.time("_inserStuff");
    if (isCustomPage == undefined || isCustomPage == "")
    {
        isCustomPage = false;
    }

    // Sacve content of the page (body)
    const pageContent = pageBody.innerHTML;

    // Replace body with page layout
    pageBody.innerHTML = layoutHtml;
    pageMain = $("main")[0];

    switch(isCustomPage)
    {
        case true:
            // Insert page content into the <main> tag
            pageMain.innerHTML = pageContent;
            break;

        case false:
            pageMain.innerHTML = articleLayoutHtml;
            $(".articleContent")[0].innerHTML = pageContent;
            break;
    }

    // Add CSS libraries
    pageHead.insertAdjacentHTML("beforeend",commonCssText);

    // Add navbar, header, and foooter
    if (layoutCached == false)
    {
        $("#websiteHeader")[0].innerHTML = headerHtml;
        $("#navigation")   [0].innerHTML = navHtml;
        $("#footerContent")[0].innerHTML = footerHtml;
    }
    
    console.timeEnd("_inserStuff");
    // Wait for codeDelay milliseconds to Reveal the built page
    let codeDelay = 250;
    setTimeout(() => 
    { 
        pageBody.style.opacity = "1";
    }, codeDelay);

    // Hide loading overlay
    if ($("#mainOverlayDiv")[0] != undefined)
    {
        isDocumentReady.then(response => 
        {
            $("#mainOverlayDiv")[0].style.display = "none"; 
        } ) ;
    }

    console.timeEnd("__TOTAL_TIME_");
}