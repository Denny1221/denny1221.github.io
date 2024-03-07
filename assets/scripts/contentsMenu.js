let contentsShown = false;
function ToggleContents()
{
    if (contentsShown)
    {
		document.getElementById("contentsToggleBtn").textContent = "Show";
		document.getElementById("contentsList").style.display = "none";
		contentsShown = false
    }
    else
    {
		document.getElementById("contentsList").style.display = "block";
		document.getElementById("contentsToggleBtn").textContent = "Hide";
		contentsShown = true;
    }
}