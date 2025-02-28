function aplicatie() {
    const canvas = document.getElementById("canvas");
    const instrumente = document.getElementById("instrumente");
    const culoareBGInput = document.getElementById("alegeCuloareBG");
    const listaFiguri = document.getElementById("listaFiguri");

    let context = canvas.getContext("2d");
    let desenare = false;
    let grosimeLinie = 1;
    let culoareLinie = "black";
    let instrumentSelectat = "creion";
    let prevMouseX = 0;
    let prevMouseY = 0;
    let copie;
    let figuri = [];
    let figuraCreion = [];
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    let culoareFundal = "white"; 

    function pozitieCanvas(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return { x, y };
    }

    function seteazaDimensiuniCanvas(canvas) {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;
        context.fillStyle = culoareFundal;
        context.fillRect(0, 0, W, H); 
    }

    function aplicaCuloareFundal(culoareFundal) {
        context.fillStyle = culoareFundal;
        context.fillRect(0, 0, W, H); 
    }

    function schimbaCuloareFundal(e) {
        if (e.target.id === "alegeCuloareBG") {
            culoareFundal = e.target.value;
            aplicaCuloareFundal(culoareFundal);  
            redeseneazaCanvas();  
        }
    }

    function copieCanvas() {
        copie = context.getImageData(0, 0, W, H);
    }

    function restaureazaCopia() {
        context.putImageData(copie, 0, 0);
    }

    function stergereCanvas() {
        context.clearRect(0, 0, W, H);
        aplicaCuloareFundal(culoareFundal); 
        figuri = [];
        actualizeazaListaFiguri();
    }

 
    function ajusteazaSetariLinie(e) {
        if (e.target.id === "alegeCuloare") {
            culoareLinie = e.target.value;
        }
        if (e.target.id === "creion") {
            grosimeLinie = e.target.value;
        }
    }

  
    function schimbaInstrumentul(e) {
        instrumentSelectat = e.target.value;
    }

    function incepeDesenarea(e) {
        desenare = true;
        context.beginPath();
        const pozitie = pozitieCanvas(e);
        prevMouseX = pozitie.x;
        prevMouseY = pozitie.y;
        context.lineWidth = grosimeLinie;
        context.strokeStyle = culoareLinie;
        copieCanvas();
        if (instrumentSelectat === "creion") {
            figuraCreion = [];
            figuraCreion.push({ x: prevMouseX, y: prevMouseY });
        }
    }


    function opresteDesenarea(e) {
        desenare = false;
        const pozitie = pozitieCanvas(e);

        const figura = {
            tip: instrumentSelectat,
            culoare: culoareLinie,
            grosime: grosimeLinie,
            startX: prevMouseX,
            startY: prevMouseY,
            endX: pozitie.x,
            endY: pozitie.y,
            puncte: figuraCreion
        };
        figuri.push(figura);
        actualizeazaListaFiguri();
    }


    function deseneazaPeCanvas(e) {
        if (!desenare)
            return;

        const pozitie = pozitieCanvas(e);

        if (instrumentSelectat === "creion") {
            context.lineWidth = grosimeLinie;
            context.strokeStyle = culoareLinie;
            context.lineCap = "round";

            context.lineTo(pozitie.x, pozitie.y);
            context.stroke();
            context.beginPath();
            context.moveTo(pozitie.x, pozitie.y);

            figuraCreion.push({ x: pozitie.x, y: pozitie.y });
        } else if (instrumentSelectat === "linie") {
            deseneazaLinie(pozitie);
        } else if (instrumentSelectat === "dreptunghi") {
            deseneazaDreptunghi(pozitie);
        }
    }

 
    function deseneazaLinie(pozitie) {
        restaureazaCopia();
        context.beginPath();
        context.moveTo(prevMouseX, prevMouseY);
        context.lineTo(pozitie.x, pozitie.y);
        context.stroke();
    }

   
    function deseneazaDreptunghi(pozitie) {
        restaureazaCopia();
        const w = pozitie.x - prevMouseX;
        const h = pozitie.y - prevMouseY;
        context.strokeRect(prevMouseX, prevMouseY, w, h);
    }

 
    function actualizeazaListaFiguri() {
        listaFiguri.innerHTML = "";
        figuri.forEach((figura, index) => {
            const figuraItem = document.createElement("div");
            figuraItem.textContent = `${index + 1}. ${figura.tip} (${figura.culoare}, grosime instrument: ${figura.grosime})`;
            figuraItem.style.cursor = "pointer";
            figuraItem.addEventListener("click", () => stergeFigura(index));
            listaFiguri.appendChild(figuraItem);
        });
    }


    function stergeFigura(index) {
        figuri.splice(index, 1);
        redeseneazaCanvas();
        actualizeazaListaFiguri();
    }

    function redeseneazaCanvas() {
        context.clearRect(0, 0, W, H);
        aplicaCuloareFundal(culoareFundal);

        figuri.forEach(figura => {
            context.lineWidth = figura.grosime;
            context.strokeStyle = figura.culoare;

            if (figura.tip === "linie") {
                context.beginPath();
                context.moveTo(figura.startX, figura.startY);
                context.lineTo(figura.endX, figura.endY);
                context.stroke();
            } else if (figura.tip === "dreptunghi") {
                context.beginPath()
                context.strokeRect(
                    figura.startX,
                    figura.startY,
                    figura.endX - figura.startX,
                    figura.endY - figura.startY
                );
            } else if (figura.tip === "creion") {
                context.beginPath();
                context.moveTo(figura.startX, figura.startY);
                figura.puncte.forEach((punct) => {
                    context.lineTo(punct.x, punct.y);
                });
                context.stroke();
            }
        });
    }

    function exportaImagine() {
        const formatImagine = "image/png";
        const link = document.createElement("a");
        link.download = "imagine.png";
        link.href = canvas.toDataURL(formatImagine);
        link.click();
    }

    canvas.addEventListener("mousedown", incepeDesenarea);
    canvas.addEventListener("mouseup", opresteDesenarea);
    canvas.addEventListener("mousemove", deseneazaPeCanvas);
    document.getElementById("btnStergere").addEventListener("click", stergereCanvas);
    document.getElementById("alegeCuloare").addEventListener("change", ajusteazaSetariLinie);
    document.getElementById("creion").addEventListener("change", ajusteazaSetariLinie);
    document.getElementById("alegeInstrument").addEventListener("change", schimbaInstrumentul);
    culoareBGInput.addEventListener("change", schimbaCuloareFundal);
    document.getElementById("btnExportaImagine").addEventListener("click", exportaImagine);

    seteazaDimensiuniCanvas(canvas);
}

document.addEventListener("DOMContentLoaded", aplicatie);
