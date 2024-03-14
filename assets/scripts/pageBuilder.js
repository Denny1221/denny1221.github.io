//
// P A G E   B U I L D E R
// v. Beta 1.1
//
console.log("=== Made with PageBuilder v. Beta 1.1 ===");
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
async function GatherResources(hideSidebar)
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

			const ovrlData = await fetch("/assets/builder/overlay.html");
			const ovrText  = await ovrlData.text();

			docBody.insertAdjacentHTML("afterend", ovrText);

			layoutData = await fetch("/assets/builder/base.html");
			headerData = await fetch("/assets/parts/header.html");
			navData    = await fetch("/assets/parts/nav.html");
			footerData = await fetch("/assets/parts/footer.html");

			layoutHtml = await layoutData.text();
			headerHtml = await headerData.text();
			navHtml    = await navData.text();
			footerHtml = await footerData.text();

			commonCssData 	  = await fetch("/assets/builder/commonStyles.html");
			articleLayoutData = await fetch("/assets/builder/articleLayout.html");
			commonCssText 	  = await commonCssData.text();
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
	CompilePage(hideSidebar);
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
async function CompilePage(hideSidebar)
{
	console.time("_inserStuff");
	// If no argument is passed to hideSidebar, default to false
	if (hideSidebar == undefined || hideSidebar == "")
	{
		hideSidebar = false;
	}
	// Save content of the page (body)
	const pageContent = docBody.innerHTML;

	// Replace body with page layout
	docBody.innerHTML = layoutHtml;
	docMain = $("main")[0];

	// Load blank layout or article layout
	switch (hideSidebar)
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
	$(".pageTitleUnderline")[0].remove();
	const titleAndHr = pageTitle + pageTitleUnderline;
	docMain.insertAdjacentHTML("afterbegin", titleAndHr);

	// Move gallery under articleContent div
	const galleryElem = $("#Gallery")[0];	
	if (galleryElem != undefined)
	{
		docMain.insertAdjacentHTML("beforeend",galleryElem.outerHTML);
		galleryElem	.remove();
	}

	console.timeEnd("_inserStuff");
	// Hide loading overlay
	if ($("#mainOverlayDiv")[0] != undefined)
	{
		isDocumentReady.then(response =>
		{
			$("#mainOverlayDiv")[0].style.display = "none";
		});
	}
	docBody.insertAdjacentHTML("beforeend","<section id='pageThemeSection'></secion>");
	docBody.insertAdjacentHTML("beforeend",'<link rel="stylesheet" href="/assets/styles/responsive.css">');

	// Add styling to tables
	StyleTables();
	CheckSavedTheme();

	// Wait for "delay" milliseconds to reveal the built page
	let delay = 100;
	setTimeout(() =>
	{
		// docBody.style.opacity = "1";
		docBody.classList.add("pageFadeIn");
		SelectRandomBackground();
	}, delay);

	delay = 1000;
	setTimeout(() =>
	{
		docBody.style.opacity = "1";
		docBody.classList.remove("pageFadeIn");
	}, delay);
	console.timeEnd("__TOTAL_TIME_");
}

function BuildPage(hideSidebar)
{
	if (location.pathname.includes("template"))
	{
		document.body.insertAdjacentHTML("afterbegin", "<h3><i>This is a template page.</i></h3>");
		// return;
	}
	GatherResources(hideSidebar);
}

function StyleTables ()
{
	const tables = $("table");
	const tHead  = $("thead");
	const tBody  = $("tbody");

	if (tables.first == undefined)
	{
		return;
	}	
	console.log("styling tables");
	for (let i = 0; i < tables.length; i++) 
	{
		// <table>
		tables[i].classList.add("table");
		tables[i].classList.add("table-striped");
		tables[i].classList.add("table-bordered");

		switch(currentTheme)
		{
			case "light":
				tHead[i].classList.remove("table-light");
				tHead[i].classList.add	 ("table-dark");
				tables[i].classList.remove("table-dark");
				break;
				
			case "dark":
				tHead[i].classList.remove("table-dark");
				tHead[i].classList.add	 ("table-light");
				tables[i].classList.add("table-dark");
				break;
		}
	}

	if (location.pathname.includes("leveling"))
	{
		$("#mainContainerForeground")[0].style.overflow = "auto";
	}
	// Make table not overflow in small window width
	const responsiveContainerHtml = '<div class="table-responsive">table</div>';

	for (let i = 0; i < tables.length; i++)
	{
		tables[i].outerHTML = responsiveContainerHtml;
	}
	const responsiveContainers = $(".table-responsive");
	for (let i = 0; i < tables.length; i++)
	{
		responsiveContainers[i].innerHTML = tables[i].outerHTML;
	}
}