const documentBody = $("body")[0];
const documentHead = $("head")[0];

let layoutData;
let headerData;
let navData;
let footerData;

let layoutHtml;
let headerHtml;
let navHtml;
let footerHtml;

documentBody.style.opacity = "0.25";

async function GatherResources ()
{
    layoutData = await fetch("/-test/base.html");
    headerData = await fetch("/assets/parts/header.html");
    navData    = await fetch("/assets/parts/nav.html"); 
    footerData = await fetch("/assets/parts/footer.html");

    layoutHtml = await layoutData.text();
    headerHtml = await headerData.text();
    navHtml    = await navData.text();
    footerHtml = await footerData.text();

    InsertStuff();
}

async function InsertStuff ()
{
    const pageContent = documentBody.innerHTML;

    documentBody.innerHTML = layoutHtml;

    $("main")[0].innerHTML = pageContent;

    const commonStylesHtml = await fetch("/-test/commonStyles.html");
    const commStylesText = await commonStylesHtml.text();
    documentHead.insertAdjacentHTML("beforeend",commStylesText);

    $("#websiteHeader")[0].innerHTML = headerHtml;
    $("#navigation")   [0].innerHTML = navHtml;
    $("#footerContent")[0].innerHTML = footerHtml;
    documentBody.style.opacity = "1";
}