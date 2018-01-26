//constants for position in array [X,Y]
const X=0;
const Y=1;

//constant collors
const BLUE = "#073782";
const GREEN = "#39b703";
const RED = "#bc0006";
const BLACK = "#000000";

//viewport constants
var VW, VH;

//drawing helpers
var ctx, canvas;

//state of drawing
var imageData=[];
var dots =[];


//called on page load completed
function initCovexHull(){
    //init drawing context and traformation for mouse position
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
    drawDot(mouse[X],mouse[Y], 5, BLUE);
    dots.push(
        [mouse[X], mouse[Y], 1]
    );
    saveState(["base"]);
}

/**
 * checks if new entry is in the current polligon or not
 */
function recomputeConvexHull_wiki(){
    console.log(dots);
    if ( dots.length > 3 ){
        let n = dots.length-1;
        let m = 1;
        dots = _.orderBy(dots, [Y],['asc']);
        dots = dots.sort((a,b) =>{
            return a[Y]-b[Y];
        });
    
        console.log(dots);
        dots[0] = dots[n];
        let Li= [];

        for (let i=2; i< n; i++ ){
            let dot = dots[i];
            console.log( math.det(math.matrix([dots[m-1], dots[m], dots[i]])) );
            console.log(ccw(dots[m-1], dots[m], dots[i]));
            console.log(dots);
            
            while (
                ccw(dots[m-1], dots[m], dots[i]) <= 0
            ){
                console.log("points "+(m-1)+","+m+","+i);
                drawLine(RED, dots[m], dots[i]);
                if (m >1 ){
                    m -=1;
                    continue;
                }
                else if( i == n)
                    break;
                else{
                    i += 1

                }
                    


            }
            m += 1;
            let temp = dots[m];
            dots[m] = dots[i];
            dots[i] = temp;

            console.log(m,"m=");
            console.log(dots,"dots=");
        }
    }    
}

function orderNodes(){
    revertToState(["base"]);
    dots.sort((u,v) =>{
        return u[X] != v[X] ? u[X]-v[X] : u[Y]-v[Y]
    });
    putNumbers(dots);
}

async function recomputeConvexHull_Graham(){
    resetStates();
    revertToState(["base"]);
    if ( dots.length > 2 ){
        let n = dots.length;
        dots.sort((u,v) =>{
            return u[X] != v[X] ? u[X]-v[X] : u[Y]-v[Y]
        });
        // dots.sort((u,v) =>{
        //     let fiU = Math.atan(u[Y] /u[X]);
        //     let fiV =  Math.atan(u[Y]/u[X]);
        //     if (fiU< fiV){
        //         return -1;
        //     }
        //     else if (fiU == fiV){
        //         return 0;
        //     }
        //     return 1;
        // });
        putNumbers(dots);
        saveState(["initial"]);
        let li= [], pointsIx=[];
        li.push(dots[0]);
        li.push(dots[1]);
        pointsIx.push(0);
        pointsIx.push(1);
        await drawLine(GREEN,dots[0],dots[1]);
        saveState(pointsIx);
        for (let i=2; i< n; i++ ){
            li.push(dots[i]);
            pointsIx.push(i);
            await drawLine(GREEN,li[li.length-2],li[li.length-1]);
            saveState(pointsIx);
            let wrongTurnPosition = true;
            wrongTurnPosition = getFirstClockwiseTurn(li);
            while (wrongTurnPosition != false){
                
                li.splice(wrongTurnPosition,1);
                pointsIx.splice(wrongTurnPosition,1);
                if ( li.length == 2){
                    revertToState(["initial"]);
                }
                else{
                    revertToState(pointsIx.slice(0,pointsIx.length-1));
                }
                
                await drawLine(GREEN, li[wrongTurnPosition-1], li[wrongTurnPosition]);
                saveState(pointsIx);
                wrongTurnPosition = getFirstClockwiseTurn(li);
            }
        }

        for (let i=n-1; i>0; i-- ){
            if ( pointsIx.indexOf(i) == -1 || i==pointsIx[0]){
                li.push(dots[i]);
                pointsIx.push(i);
                await drawLine(GREEN,li[li.length-2],li[li.length-1]);
                saveState(pointsIx);
                let wrongTurnPosition = true;
                wrongTurnPosition = getFirstClockwiseTurn(li);
                while (wrongTurnPosition != false){
                    
                    li.splice(wrongTurnPosition,1);
                    pointsIx.splice(wrongTurnPosition,1);
                    if ( li.length == 2){
                        revertToState(["initial"]);
                    }
                    else{
                        revertToState(pointsIx.slice(0,pointsIx.length-1));
                    }
                    
                    await drawLine(GREEN, li[wrongTurnPosition-1], li[wrongTurnPosition]);
                    saveState(pointsIx);
                    wrongTurnPosition = getFirstClockwiseTurn(li);
                }
            }
        }

        await drawLine(GREEN, li[li.length -1], li[0]);
        saveState(pointsIx);
    }    

    return false;
}

function putNumbers(dots){
    for (let i=0; i< dots.length; i++){
        ctx.fillStyle = BLACK;
        ctx.font = '30px serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText(i, dots[i][X], dots[i][Y]);
    }
    
}

function getFirstClockwiseTurn( li ){
    for  (let i=li.length-2; i>=1; i --){
        //math.det(math.matrix([li[i-1], li[i],li[i+1]]))
        if (ccw(li[i-1], li[i],li[i+1]) <= 0)
            return i;
    }
    return false;
}

function ccw(p1, p2, p3){
    return (p2[X] - p1[X])*(p3[Y] - p1[Y]) - (p2[Y] - p1[Y])*(p3[X] - p1[X]);
}

function fillRect(){
    ctx.fillRect(25, 25, 100, 100);
    ctx.fillRect(100, 0, 140, 100);
}

async function drawLine(color, start, end){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(start[X],start[Y]);
    ctx.lineTo(end[X], end[Y]);
    ctx.stroke();
    await sleep(1000);
}

function saveState( points ){
    let hash = "";
    for(let i=0;i< points.length; i++)
        hash = hash +"->"+ points[i];

    console.log("save hash'"+hash+"'");
    imageData[hash] = ctx.getImageData(0,0,canvas.width,canvas.height);
}

function revertToState( points ){
    let hash = "";
    for(let i=0;i< points.length; i++)
        hash = hash+"->" + points[i];

    console.log("revert to hash -> "+hash);
    ctx.putImageData(imageData[hash], 0, 0);
}

function resetCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imageData=[];
    dots =[];
    return false;
}

function resetStates(){
    let baseState = imageData['->base'];
    imageData = [];
    imageData['->base'] = baseState;
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

function removeElement(array, element){
    let newArray = [];
    for(let i=0;i<array.length; i++){
        if ( i != element ){
            newArray.push(array[i]);
        }
        
    }
    return newArray;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}