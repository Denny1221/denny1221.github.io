const docBody = $("body")[0];
const docHead = $("head")[0];
let docMain; // = $("main")[0];

// Set opacity tpo 0 to hide everything
docBody.style.opacity = "0.0";

// Get document (page) ready state
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
	}, 1000);
});

// Various page components
let layoutData; let headerData;	let navData; let footerData;
let layoutHtml; let headerHtml; let navHtml; let footerHtml;
let commonCssData; let commonCssText; let articleLayoutData; let articleLayoutHtml;

// RETRIEVE CODE FOR EACH COMPONENT
async function GatherResources(isCustomPage)
{
	console.time("__TOTAL_TIME_");
	console.time("_getHtmlData");

	IsLayoutCodeCached();
	switch (layoutCached)
	{
		case true:
			layoutHtml = sessionStorage.getItem("layoutHtml");
			headerHtml = sessionStorage.getItem("headerHtml");
			navHtml = sessionStorage.getItem("navHtml");
			footerHtml = sessionStorage.getItem("footerHtml");

			commonCssText = sessionStorage.getItem("commonCSS");
			articleLayoutHtml = sessionStorage.getItem("articleLayoutHtml");
			break;

		case false:
			console.log("Layout code isn't chached. Downloading it from the server.");

			const ovrlData = await fetch("./overlay.html");
			const ovrText = await ovrlData.text();

			docBody.insertAdjacentHTML("afterend", ovrText);

			layoutData = await fetch("/-test/base.html");
			headerData = await fetch("/assets/parts/header.html");
			navData = await fetch("/assets/parts/nav.html");
			footerData = await fetch("/assets/parts/footer.html");

			layoutHtml = await layoutData.text();
			headerHtml = await headerData.text();
			navHtml = await navData.text();
			footerHtml = await footerData.text();

			commonCssData = await fetch("/-test/commonStyles.html");
			articleLayoutData = await fetch("/-test/articleLayout.html");
			commonCssText = await commonCssData.text();
			articleLayoutHtml = await articleLayoutData.text();

			sessionStorage.setItem("layoutHtml", layoutHtml);
			sessionStorage.setItem("headerHtml", headerHtml);
			sessionStorage.setItem("navHtml", navHtml);
			sessionStorage.setItem("footerHtml", footerHtml);

			sessionStorage.setItem("commonCSS", commonCssText);
			sessionStorage.setItem("articleLayoutHtml", articleLayoutHtml);
			break;
	}
	console.timeEnd("_getHtmlData");
	CompilePage(isCustomPage);
}
//
// SET IF LAYOUT IS CACHED
//
let layoutCached = false;

function IsLayoutCodeCached()
{
	if (sessionStorage.getItem("layoutHtml") == null || sessionStorage.getItem("headerHtml") == null || sessionStorage.getItem("navHtml") == null ||
		sessionStorage.getItem("footerHtml") == null || sessionStorage.getItem("articleLayoutHtml") == null || sessionStorage.getItem("commonCSS") == null)
	{
		layoutCached = false;
	}
	else
	{
		layoutCached = true;
	}
}
//
// BUILD PAGE
//
async function CompilePage(isCustomPage)
{
	console.time("_inserStuff");
	// If no argument is passed to isCustomPage, default to false
	if (isCustomPage == undefined || isCustomPage == "")
	{
		isCustomPage = false;
	}
	// Save content of the page (body)
	const pageContent = docBody.innerHTML;

	// Replace body with page layout
	docBody.innerHTML = layoutHtml;
	docMain = $("main")[0];

	// Load blank layout or article layout
	switch (isCustomPage)
	{
		case true:
			// Insert page content into the <main> tag
			docMain.innerHTML = pageContent;
			break;

		case false:
			docMain.innerHTML = articleLayoutHtml;
			$(".articleContent")[0].innerHTML = pageContent;
			break;
	}

	// Add CSS libraries
	docHead.insertAdjacentHTML("beforeend", commonCssText);

	// Add navbar, header, and foooter if layout isnt cached
	if (layoutCached == false)
	{
		$("#websiteHeader")[0].innerHTML = headerHtml;
		$("#navigation")   [0].innerHTML = navHtml;
		$("#footerContent")[0].innerHTML = footerHtml;
	}

	// If there's an element with the id of sidebar, move it to the right column
	if ($("#sidebar")[0] != undefined)
	{
		const sideBarContent = $("#sidebar")[0].innerHTML;
		$("#sidebar")[0].remove();
		$(".articleSidebar")[0].insertAdjacentHTML("beforeend", sideBarContent);
	}

	// Get article title and underline 
	const pageTitle = $(".pageTitle")[0].outerHTML;
	const pageTitleUnderline = $(".pageTitleUnderline")[0].outerHTML;

	// Move article title and underline outisde of the aritcle container
	$(".pageTitle").remove();
	$(".pageTitleUnderline").remove();
	const titleAndHr = pageTitle + pageTitleUnderline;
	docMain.insertAdjacentHTML("afterbegin", titleAndHr);

	console.timeEnd("_inserStuff");
	// Hide loading overlay
	if ($("#mainOverlayDiv")[0] != undefined)
	{
		isDocumentReady.then(response =>
		{
			$("#mainOverlayDiv")[0].style.display = "none";
		});
	}

	// Wait for "delay" milliseconds to reveal the built page
	let delay = 100;
	setTimeout(() =>
	{
		// docBody.style.opacity = "1";
		docBody.classList.add("pageFadeIn");
	}, delay);

	// Wait for "delay" milliseconds to reveal the built page
	delay = 1000;
	setTimeout(() =>
	{
		docBody.style.opacity = "1";
		docBody.classList.remove("pageFadeIn");
	}, delay);
	console.timeEnd("__TOTAL_TIME_");
}

function BuildPage(isCustomPage)
{
	if (location.pathname.includes("template"))
	{
		document.body.insertAdjacentHTML("afterbegin", "<h1>Template.html is not intended to be viewed as a web page.</h1>");
		return;
	}
	GatherResources(isCustomPage);
}