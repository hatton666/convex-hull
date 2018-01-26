//constants for position in array [X,Y]
const X=0;
const Y=1;

//constant collors
const YELLOW = "#f4bc42";
const GREEN = "#39b703";
const RED = "#bc0006";

var dots =[];

var ctx, canvas;

//viewport constants
var VW, VH;

//called on page load completed
function initCovexHull(){
    canvas = document.getElementById("points");
 

    checkIfCanvasSupported();
    ctx = canvas.getContext('2d');

    VW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    VH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    canvas.width  =VW; 
    canvas.height =VH;
    console.log("viewport "+VW+" x "+VH);
}

/**
 * draws a dot of ~5px
 */
function addNewDot(){
    let mouse = getMouse();
    drawDot(mouse[X],mouse[Y], 5, YELLOW);
    dots.push(
        [mouse[X], mouse[Y], 1]
    );
    recomputeConvexHull();
}

/**
 * checks if new entry is in the current polligon or not
 */
function recomputeConvexHull(){
    if ( dots.length > 2 ){
        let n = dots.length;
        let m = 1;
        dots = _.orderBy(dots, [Y],['asc']);
        console.log(dots);
        //stop condition 
        dots[0] = dots[n];

        for (let i=2; i< dots; i++ ){
            let dot = dots[i];
            while (
                math.det(math.matrix([dots[m-1], dots[m], dots[i]])) <= 0
            ){
                //TODO: plot yellow line
                if (m >1 ){
                    m -=1;
                    continue;
                }
                else if( i == N)
                    break;
                else
                    i += 1
            }
            m += 1;
            let temp = dots[m];
            dots[m] = dots[i];
            dots[i] = temp;
        }
    }    
}

function fillRect(){
    ctx.fillRect(25, 25, 100, 100);
    ctx.fillRect(100, 0, 140, 100);
}

/**
 * Returns array of [x,y]
 * 
 */
function getMouse(){
    let evt = window.event;
    let rect = canvas.getBoundingClientRect();
    let x = 6 + rect.width * (evt.clientX - rect.left)/VW;;
    let y = 6 + rect.height * (evt.clientY - rect.top)/VH;
    return [x, y];
}


//utilitary functions
function checkIfCanvasSupported(){
if ( !canvas.getContext("2d") ) {
        alert("Canvas is not supported!");
        throw "Canvas is not supported!";
    }
}
function drawDot(x,y,radius,color){
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(x, y, radius, 0, Math.PI *2, false);
    ctx.fillStyle = color;
    ctx.fill();
}