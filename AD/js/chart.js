/* global Plotly */

// The function returns normalized value between 0 to 100
function rNorm(x, xI, mI) {
    return (((x - mI) / (xI - mI)) * 100);
}

// to normalize exon, snp, etc to sync. with exon span
function rNorm2(x, xI, mI, nxI, nmI) {
    return (((x - mI) / (xI - mI)) * (nxI - nmI));
}

function pushAll(from, to) {
    for (var i = 0; i < from.length; i++) {
        to.push(from[i]);
    }
}

function pushAllGrp(from, to) {
    for (var i = 0; i < from.length; i++) {
        var tmp = [];
        for (var j = 0; j < from[i].length; j++) {
            tmp.push(from[i][j]);
        }
        to.push(tmp);
    }
}

function drawMain(data, update) {
    var totyt = data.yt
    for (var i = 0; i < data.yt.length; i++) {
		data.yt[i] = data.yt[i].toUpperCase()
    }
    // sc = 0, transcript viewer 
    // sc = 1, genome browser 
    
    //var start = new Date().getTime();
    
    var sc = $("#slider1").val() / 100;
    
    // maximum exon count for normalization
    var maxC = data.maxC;
    // direction
    var D = data.D;
    var dirct = [];
    setDirection(D, dirct);
    
    // earliest offset
    var mI = data.mI;
    // latest offset
    var xI = data.xI;
    // exon span total
    var eT = data.eT;
    // intron span total
    var iT = data.iT;
    // get percentages of eT and iT
    eT = (eT * 100) / (xI - mI);
    iT = (iT * 100) / (xI - mI);

    // y axis labels for exon
    var yt = [];
    pushAll(data.yt, yt);
    
    // add "Exon Usage" label     
    var eul = 'Exon Usage'; 
    var snpl = 'SNP'; 
    var metl = 'Met'; 
    var mirl = 'miRNA';
    
    var ye = [eul, snpl, metl, mirl];
    var y = ye.concat(yt);
    // the number of y labels
    var M = y.length;

    // exon usage counts
    var eCnt = [];
    pushAll(data.eCnt, eCnt);

    // to set group color of each exon
    var gC = [];
    pushAllGrp(data.gC, gC);
    var gCc = [];
    pushAllGrp(data.gCc, gCc);
    var exonEnst = [];
    pushAllGrp(data.exonEnst, exonEnst);

    // for offset index
    var oMap = new Map();
    // for set up each exon usage offset
    
    var xDU = [];
    // exon usage line
    var esc = ( 1 + ((iT * (1 - sc)) / eT));
    var pre = 0; // scaled
    for (var i = 0; i < data.xDU.length; i++) {
        var st = rNorm(data.xDU[i][0], xI, mI);
        var ed = rNorm(data.xDU[i][1], xI, mI);
        
        var nSt = 100;
        if (i + 1 < data.xDU.length) {
            nSt = rNorm(data.xDU[i + 1][0], xI, mI);
        }
        // exon ans intron scaling
        var lenE = (ed - st) * esc;
        var lenI = (nSt - ed) * sc; // for next
        // set new scaled span
        var sSt = pre;
        var sEd = sSt + lenE;
        
        xDU.push([sSt, sEd]);
        
        for (var j = data.xDU[i][0]; j <= data.xDU[i][1]; j++) {
            oMap.set(j, sSt + rNorm2(j, data.xDU[i][1], data.xDU[i][0], sEd, sSt));
        }
        
        pre = sEd + lenI;
        
        if (i + 1 < data.xDU.length) {
            for (var j = data.xDU[i][1]; j <= data.xDU[i + 1][0]; j++) {
                oMap.set(j, sEd + rNorm2(j, data.xDU[i + 1][0], data.xDU[i][1], pre, sEd));
            }
        }
        
    }
    
    // for each line of exons
    var xD = [];
    for (var i = 0; i < data.xD.length; i++) {
        var xE = [];
        for (var j = 0; j < data.xD[i].length; j++) {
            xE.push([oMap.get(data.xD[i][j][0]), oMap.get(data.xD[i][j][1])]);
        }
        xD.push(xE);
    }
    // outside cds
    var xDc = [];
    for (var i = 0; i < data.xDc.length; i++) {
        var xE = [];
        for (var j = 0; j < data.xDc[i].length; j++) {
            xE.push([oMap.get(data.xDc[i][j][0]), oMap.get(data.xDc[i][j][1])]);
        }
        xDc.push(xE);
    }
        
    //snp
    //snpId, snpSt
    var snpId = [];
    var snpSt = [];
    //var snpStOr = [];
    
    for (var i = 0; i < data.snpId.length; i++) {
        snpId.push(data.snpId[i]);
        snpSt.push(oMap.get(data.snpSt[i]));
        //snpStOr.push(data.snpSt[i]);
    }
    //met
    //metId, metSt
    var metId = [];
    var metSt = [];
    for (var i = 0; i < data.metId.length; i++) {
        metId.push(data.metId[i]);
        metSt.push(oMap.get(data.metSt[i]));
    }
    //miRNA
    //mirId, mirSpan
    var mirId = [];
    var mirSpan = [];
    for (var i = 0; i < data.mirId.length; i++) {
        mirId.push(data.mirId[i]);
        mirSpan.push([oMap.get(data.mirSpan[i][0]), oMap.get(data.mirSpan[i][1])]);
    }   
    
    //  do line normalization
    var xL = [];
    for (var i = 0; i < data.xL.length; i++) {
        xL.push([oMap.get(data.xL[i][0]), oMap.get(data.xL[i][1])]);
    }
    // do xTick normalization
    var xTick = [];
    var xText = [];   
    for (var i = 0; i < data.xTick.length; i++) {
        xTick.push(oMap.get(data.xTick[i]));
	if (i === 0 || i === data.xTick.length - 1) {
	    xText.push(data.xTick[i]);
	} else {
	    xText.push('');
	}
    }	
    
    var dAnnots = [{
        xref: 'paper',
        yref: 'paper',
        x: 0,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[0],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }}, 
    {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[1],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }];
    
    var highType = data.highs[0];
    var highText = data.highs[1];
    
    var highSpan1 = [];
    for (var i = 0; i < data.highs[2].length; i++) {
        highSpan1.push(oMap.get(data.highs[2][i]));
    }
    var highSpan2 = [];
    for (var i = 0; i < data.highs[3].length; i++) {
        highSpan2.push(oMap.get(data.highs[3][i]));
    }
    
    // chart data
    var traces = [];

    // draw lines
    var xsL = [];
    var ysL = [];
    
    // miRNA line
    xsL.push(0);
    xsL.push(100);
    xsL.push(100);
    ysL.push(mirl);
    ysL.push(mirl);
    ysL.push(null);
    // Met line
    xsL.push(0);
    xsL.push(100);
    xsL.push(100);
    ysL.push(metl);
    ysL.push(metl);
    ysL.push(null);
    // snp line
    xsL.push(0);
    xsL.push(100);
    xsL.push(100);
    ysL.push(snpl);
    ysL.push(snpl);
    ysL.push(null);
    // exon usgae line
    xsL.push(0);
    xsL.push(100);
    xsL.push(100);
    ysL.push(eul);
    ysL.push(eul);
    ysL.push(null);
    
    for (var i = 0; i < xL.length; i++) {
        xsL.push(xL[i][0]);
        xsL.push(xL[i][1]);
        xsL.push(xL[i][1]);
        ysL.push(yt[i]);
        ysL.push(yt[i]);
        ysL.push(null);
    }
    
    traces.push({
        x: xsL,
        y: ysL,
        connectgaps: false,
        line: {
            color: 'rgba(0,0,0,0.2)',
            width: 0.8
        },
        hoverinfo:'none',
        mode: 'lines'
    });
    
    var xsLD = [];
    var ysLD = [];
    
    for (var i = 0; i < xL.length; i++) {
        xsLD.push(0);
        xsLD.push(xL[i][0]);
        xsLD.push(xL[i][0]);
        ysLD.push(yt[i]);
        ysLD.push(yt[i]);
        ysLD.push(null);
	
        xsLD.push(xL[i][1]);
        xsLD.push(100);
        xsLD.push(100);
        ysLD.push(yt[i]);
        ysLD.push(yt[i]);
        ysLD.push(null);
    }
    
    traces.push({
        x: xsLD,
        y: ysLD,
        connectgaps: false,
        line: {
	    dash: 'dot',
            color: 'rgba(87,124,188,0.1)',
            width: 0.8
        },
        hoverinfo:'none',
        mode: 'lines'
    });    
    
    
    // draw exon usage
    var enstTrMap = new Map();
    var cNVal = $('#cN').val() * 1;
    for (var i = 0; i < xDU.length; i++) {       
        var xs = [];
        var ys = [];
        var ec = [];
        
        var ecIdx = i + 1;
        if (D === 1) {
            ecIdx = xDU.length - i;
        }
        var ecVal = "E" + ecIdx + ": " + eCnt[i] + "/" + yt.length;
        
        xs.push(xDU[i][0]);
        ys.push(eul);
        ec.push(ecVal);
        // for click event
        var c = (xDU[i][0] + xDU[i][1])/2;
        var ep = xDU[i][0] + 5;
        while (ep < c) {
            xs.push(ep);
            ys.push(eul);
            ec.push(ecVal);
            ep += 5;
        }
        // for center
        xs.push(c);
        ys.push(eul);
        ec.push(ecVal);
        ep = c + 5;
        while (ep < xDU[i][1]) {
            xs.push(ep);
            ys.push(eul);
            ec.push(ecVal);
            ep += 5;
        }        
        xs.push(xDU[i][1]);
        ys.push(eul);
        ec.push(ecVal);
        
        var color = cMix(1, maxC, eCnt[i]);
        // highlight clicked exon
        if (cNVal === traces.length) {
            color = '#98DBC6';
        } 
        
        var trace = {
            x: xs,
            y: ys,
            
            line: {
                width: 10, // * eCnt[i] / maxC,
                color: color
            },
            text: ec,
            hoverinfo:'text',
            mode: 'lines'
        };
        traces.push(trace);
        enstTrMap.set(traces.length - 1, i);
    }
    
    //draw exons start
    var xsO = [];
    var ysO = [];    
    var xsE = [];
    var ysE = [];
    
    for (var k = 0; k < xD.length; k++) { // row
        for (var i = 0; i < xD[k].length; i++) { // exon
            if (gC[k][i] === 0) {
                xsO.push(xD[k][i][0]);
                xsO.push(xD[k][i][1]);
                xsO.push(xD[k][i][1]); // for intron, y: null           
                ysO.push(yt[k]);
                ysO.push(yt[k]);
                ysO.push(null);
            } else {
                xsE.push(xD[k][i][0]);
                xsE.push(xD[k][i][1]);
                xsE.push(xD[k][i][1]); // for intron, y: null           
                ysE.push(yt[k]);
                ysE.push(yt[k]);
                ysE.push(null);
            }
        }
    }

    for (var i = 0; i < 2; i++) {
        var xs = [];
        var ys = [];
        var color;
        
        if (i === 0) {
            xs = xsE;
            ys = ysE;
            color = 'rgba(204, 204, 204, 1)';
        } else {
            xs = xsO;
            ys = ysO;
            color = 'rgba(156, 165, 196, 1)';
        }
        
        var trace = {
            x: xs,
            y: ys,
            connectgaps: false,
            line: {
                width: 10,
                color: color
            },
            hoverinfo:'none',
            mode: 'lines'
        };
        traces.push(trace); 
    }
    
    var xsOc = [];
    var ysOc = [];    
    var xsEc = [];
    var ysEc = [];
    
    for (var k = 0; k < xDc.length; k++) { // row
        for (var i = 0; i < xDc[k].length; i++) { // exon
            if (gCc[k][i] === 0) {
                xsOc.push(xDc[k][i][0]);
                xsOc.push(xDc[k][i][1]);
                xsOc.push(xDc[k][i][1]); // for intron, y: null           
                ysOc.push(yt[k]);
                ysOc.push(yt[k]);
                ysOc.push(null);
            } else {
                xsEc.push(xDc[k][i][0]);
                xsEc.push(xDc[k][i][1]);
                xsEc.push(xDc[k][i][1]); // for intron, y: null           
                ysEc.push(yt[k]);
                ysEc.push(yt[k]);
                ysEc.push(null);
            }
        }
    }

    for (var i = 0; i < 2; i++) {
        var xs = [];
        var ys = [];
        var color;
        
        if (i === 0) {
            xs = xsEc;
            ys = ysEc;
            color = 'rgba(204, 204, 204, 1)';
        } else {
            xs = xsOc;
            ys = ysOc;
            color = 'rgba(156, 165, 196, 1)';
        }
        
        var trace = {
            x: xs,
            y: ys,
            connectgaps: false,
            line: {
                width: 6,
                color: color
            },
            hoverinfo:'none',
            mode: 'lines'
        };
        traces.push(trace); 
    }    
    //draw exons end
    
    // draw snp
    var ySnps = [];
    for (var i = 0; i < snpSt.length; i++) {       
        ySnps.push(snpl);
    }
    
    traces.push({
        x: snpSt,
        y: ySnps,
            
        marker: {
	    symbol: 142,
	    size: 6,
	    color: '#E66EAE'
	},
        text: snpId,
        hoverinfo: "text",
	mode: 'markers'
    }); 
    
    // draw met
    var yMets = [];
    for (var i = 0; i < metSt.length; i++) {       
        yMets.push(metl);
    }
        
    traces.push({
        x: metSt,
        y: yMets,
            
        marker: {
	    symbol: 142,
	    size: 6,
	    color: '#F56C5C'
	},
        text: metId,
        hoverinfo: "text",
	mode: 'markers'
    });
    
    // draw miRNA
    var xMirs = [];
    var yMirs = [];
    var idMir = [];
    for (var i = 0; i < mirSpan.length; i++) {       
        
        xMirs.push(mirSpan[i][0]);
        xMirs.push(mirSpan[i][1]);
        xMirs.push(mirSpan[i][1]);
        yMirs.push(mirl);
        yMirs.push(mirl);
	yMirs.push(null);
        
        idMir.push(mirId[i]);
        idMir.push(mirId[i]);
        idMir.push('none');
    }
    
    traces.push({
	x: xMirs,
	y: yMirs,
	connectgaps: false,

	line: {
	    width: 10,
	    color: '#BABABA'
	},
	text: idMir,
        hoverinfo: "text",
	mode: 'lines'
    }); 
    
    if (highType === 'snp' || highType === 'met' || highType === 'mir') {
            
        var hTick;
        var hText = highText;

        var yH = snpl;
        if (highType === 'met') {
            yH = metl;
        } else if (highType === 'mir') {
            yH = mirl;
        } 

        // draw highlighted search term
        var xHs = [];
        var yHs = [];
        var tHs = [];

        for (var i = 0; i < highSpan1.length; i++) {
            xHs.push(highSpan1[i]);
            yHs.push(yH);
            tHs.push(highText);
            if (highType === 'mir') {
                xHs.push(highSpan2[i]);
                yHs.push(yH);
                tHs.push(highText);

                xHs.push(null);
                yHs.push(yH);
                tHs.push('none');
            }
        }

        if (highType === 'mir') {
            hTick = (highSpan1[0] + highSpan2[0])/2;
        } else {
            hTick = highSpan1[0];
        }

        if (highType === 'mir') {
            traces.push({
                x: xHs,
                y: yHs,
                connectgaps: false,

                line: {
                    width: 10,
                    color: '#66B2FF'
                },
                text: tHs,
                hoverinfo: "text",
                mode: 'lines'
            });     
        } else if (highType === 'snp' || highType === 'met') {
            traces.push({
                x: xHs,
                y: yHs,

                marker: {
                    symbol: 142,
                    size: 6,
                    color: '#66B2FF'
                },
                text: tHs,
                hoverinfo: "text",
                mode: 'markers'
            });     
        }
        
        if (highSpan1.length > 0) {
            dAnnots.push({
                x: hTick,
                y: -0.16,
                xref: 'x',
                yref: 'paper',
                yanchor: 'bottom',
                showarrow: false,
                text: hText,
                font: {
                    size: 8,
                    color: '#66B2FF'
                }
            });   
        }
    }
              
    // set y axis height
    var cHeight = M * 20;
    if (cHeight < 200) {
	cHeight = 200;
    }
    var cWidth = $("#MainChart").parent().width()*0.9;
    // set layout
    var layout = {
        hovermode: 'closest',
        dragmode: 'pan',
        showlegend: false,
	paper_bgcolor: 'rgb(255, 255, 255)',
	plot_bgcolor: 'rgb(255, 255, 255)',
        
        autosize: false,
        width: cWidth,
        height: cHeight,
  
        margin: {
            l: 80,
            r: 30,
            b: 40,
            t: 30,
            pad: 0,
            autoexpand: false
        },

        xaxis: {
            autorange: false,    
            range: [0, 100],

            gridcolor: "rgba(0, 0, 0, 0.05)",
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showticklabels: true,
            tick0: 0,
            fixedrange: false,    
            zeroline: false,
	    showgrid: true,
	    
            tickvals: xTick,
	    ticktext: xText,
	    tickangle: 0,
	    tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },
        
        yaxis: {
            autorange: true,
            anchor: "x",
            autotick: false,
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showgrid: false,
            showline: true,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: true,

            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },
	
        // for direction
	annotations: dAnnots
    };
    
    var myPlot = document.getElementById('MainChart');
    
    if (update === 0) {
        // draw a plot
        Plotly.newPlot(myPlot, traces, layout, {displaylogo: false, scrollZoom: true, doubleClick: false, 
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud', 
            'toImage',
            'pan2d',
            'select2d',
            'lasso2d',
            'zoom2d', 
            'hoverClosestCartesian', 
            'hoverCompareCartesian',
            'autoScale2d'
            ],
            modeBarButtonsToAdd: [{
                    name: 'Download plot as a png',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'png', width: cWidth, height: cHeight, filename: 'GeneChart'});                   
                    }
                },
                {
                    name: 'Download plot as a svg',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'svg', width: cWidth, height: cHeight, filename: 'GeneChart'});                   
                    }
                }
            ]            
        });
    
        // to alert no highlighted can be dispalyed
        if (highSpan1.length === 0 && highType !== '') {
            if (highType === 'snp') {
                $('#mainModal').find('.modal-title').text("SNP");
            } else if (highType === 'met') {
                $('#mainModal').find('.modal-title').text("Methylation");
            } else if (highType === 'mir') {
                $('#mainModal').find('.modal-title').text("miRNA");
            }
            $('#mainModal').find('.modal-body').html("<b>" + highText + "</b> exists out of range");
            $('#mainModal').modal('show');
        }
 
	myPlot.on('plotly_click', function(pdata){
	    
	    var ensts = [];
            var eId = 0;
            var eIdColor = 'none';
	    var eClicked = 0; // exon usgae row clicked
            /*
	    var sClicked = 0; // snp click
	    var mClicked = 0; // met click
	    var rClicked = 0; // miRNA click
            var pId = "";
            var snpSpan = 0;
            */
            
            var cN = 0;
            var cNOld = $('#cN').val() * 1;
	    for(var i = 0; i < pdata.points.length; i++){
                //alert(exonEnst.length);
		var pt = pdata.points[i];
		if (pt.y === eul) {
                    cN = pt.curveNumber;
                    eId = enstTrMap.get(cN);
                    eIdColor = pt.data.line.color;
		    ensts = exonEnst[eId];
                    //alert(pt.y + " " + pt.curveNumber + " " + i);
                    if (ensts !== undefined && ensts !== null) {
                        //alert(pt.y + " " + pt.curveNumber + " " + ensts.length);
                        eClicked = 1;
                    }
		} /*else if (pt.y === snpl) {
                    pId = pt.data.text[pt.pointNumber];
                    sClicked = 1;
                    snpSpan = snpStOr[pt.pointNumber];
		} else if (pt.y === metl) {
                    pId = pt.data.text[pt.pointNumber];
                    mClicked = 1;
		} else if (pt.y === mirl) {
                    pId = pt.data.text[pt.pointNumber];                    
                    rClicked = 1;
                } */
	    }
	    
	    if (eClicked === 1 && cN !== cNOld) {
                
                $('#tInfo').removeClass('hidden');
                $('#twoHeader').removeClass('hidden');
                $('#twHeader').removeClass('hidden');
                $('#snpGuide').removeClass('hidden');
                
                // set exon index for one exon charts
                var eIdColorOld = $('#eIdColor').val();
                
                // highlight clicked exon
                if (cNOld === -1) {
                    var update = {
                        'line.color': ['#98DBC6']
                    };
                    Plotly.restyle('MainChart', update, [cN]);
                } else {
                    var update = {
                        'line.color': [eIdColorOld, '#98DBC6']
                    };
                    Plotly.restyle('MainChart', update, [cNOld, cN]);
                }

                // save exon id, curve number, and color
                $('#eId').attr('value', eId);
                $('#cN').attr('value', cN);
                $('#eIdColor').attr('value', eIdColor);
                                
                $(".enst-each-a").addClass('hidden');
                $(".enst-each-a").removeClass('active');
                $(".enst-each-b.hidden").removeClass('hidden');
                $(".enst-each-b").addClass('active');
                
                var ytl = yt.length;
		for (var i = 0; i < ensts.length; i++) {
		    var rI = ytl - ensts[i];
                    $(".enst-each-a").eq(rI).removeClass('hidden');
                    $(".enst-each-a").eq(rI).addClass('active');
                    
                    $(".enst-each-b").eq(rI).addClass('hidden');
                    $(".enst-each-b").eq(rI).removeClass('active');
		}
                
                // check if option is collapsed
                if ($(".cancer-tab-toggle").children("span").hasClass("glyphicon-plus")) {
                    $(".cancer-tab-toggle").click();                    
                }
                // show exon option
                $('#opTab1o1').click();
                
                // hide previous results or initialize
                $("#snp-selected").text('');
                $("#sn-result").text('');
                $("#sre-table").addClass("hidden");
                $("#snId").val(null);
                $("#snSp").val(null);

                $("#met-selected").text('');
                $("#me-result").text('');
                $("#meId").val(null);
                $("#meSp").val(null);

                $("#rna-selected").text('');
                $("#rn-result").text('');
                $("#rnId").val(null);
                $("#rnSp").val(null);

                
                // draw sub graphs
                drawSub(data, "met", "MetChart", "met-selected", "me-result", "meId", "meSp");
                drawSub(data, "snp", "SnpChart", "snp-selected", "sn-result", "snId", "snSp");
                drawSubRNA(data, "rna", "RnaChart", "rna-selected", "rn-result", "rnId", "rnSp");
                
                /*
                if ($('#t1').hasClass('active') || $('#t2').hasClass('active')) {
                    $('#taskTab1Met').click();
                }
                */
                
                
	    } /* else if (sClicked === 1) {
                $("#snp-selected").text(pId);
                $("#snId").val(pId);
                $("#snSp").val(snpSpan);
                $('#taskTab1Snp').click();
	    } else if (mClicked === 1) {
                $("#met-selected").text(pId);
                $("#meId").val(pId);
                $('#taskTab1Met').click();
	    } else if (rClicked === 1) {
                $("#rna-selected").text(pId);
                $("#rnId").val(pId);
                $('#taskTab1Rna').click();
	    } */
	});	    
    
    } else {
        myPlot.data = traces;
        myPlot.layout = layout;
        Plotly.redraw(myPlot);
    }

	
    //var end = new Date().getTime();
    //var time = end - start;
    //alert('7n: ' + time);

}

function drawSub(data, sub, chartId, dId, dExtra, hId, hSp) {
    
    var eId = $('#eId').val() * 1;
    var sc = 0.5;
    
    // direction
    var D = data.D;
    var dirct = [];
    setDirection(D, dirct);
    
    // get color
    var eColor = 'rgba(204, 204, 204, 1)';
    
    var cCode = data.xDUc[eId];
    
    // get new min and max span of group containing the exon
    var pEId = eId;
    for (var i = eId - 1; i >=0; i--) {
        if (cCode !== data.xDUc[i]) {
            break;
        }
        pEId = i;
    }
    var nEId = eId;
    for (var i = eId + 1; i < data.xDUc.length; i++) {
        if (cCode !== data.xDUc[i]) {
            break;
        }
        nEId = i;
    }
    
    if (cCode === 0) {
        eColor = 'rgba(156, 165, 196, 1)';
    }
    
    var st = data.xDU[eId][0];
    var ed = data.xDU[eId][1];
    
    var gSt = data.xDU[pEId][0];
    var gEd = data.xDU[nEId][1];
    
    // smallest offset   
    var mI = gSt;
    // latest offset
    var xI = gEd;
    
    if (pEId > 0) {
        mI = data.xDU[pEId - 1][1];
    }
    if (nEId + 1 < data.xDU.length) {
        xI = data.xDU[nEId + 1][0];
    }
    
    var ra = [];
    // for offset index
    var oMap = new Map();
    getBoundary(eId, pEId, nEId, data, sc, ra, oMap);
    
    var gsSt = rNorm2(ra[1], ra[5], ra[0], 100, 0);
    var sSt = rNorm2(ra[2], ra[5], ra[0], 100, 0);
    var sEd = rNorm2(ra[3], ra[5], ra[0], 100, 0);
    var gsEd = rNorm2(ra[4], ra[5], ra[0], 100, 0);
    
    var xDU = [sSt, sEd];
    var xDUG = [[gsSt, sSt], [sEd, gsEd]];

    var subDataId;
    var subDataSpan;
    var subDataCh;
    var sColor = '#E66EAE';

    if (sub === "met") {
        subDataId = data.metId;
        subDataSpan = data.metSt;
        subDataCh = data.metCh;
        sColor = '#F56C5C';
    } else if (sub === "snp") {
        subDataId = data.snpId;
        subDataSpan = data.snpSt;
        subDataCh = data.snpCh;
        sColor = '#E66EAE';
    } else {
        return;
    }
    
    var highType = data.highs[0];
    var highText = data.highs[1];
    
    var highSpan1 = [];
    var highSpanO1 = [];
    for (var i = 0; i < data.highs[2].length; i++) {
        highSpan1.push(oMap.get(data.highs[2][i]));
        highSpanO1.push(data.highs[2][i]);
    }

    var subId = [];
    var subSpan = [];
    var subSpanOr = [];
    var subSpanCh = [];
    var ySubsTmp = [];
    
    var ySubToggle = 0;
    var preSubSpan = 0;
    var yMul = 0;
    for (var i = 0; i < subDataId.length; i++) {
        var mSt = subDataSpan[i];
        if (mSt >= mI && mSt <= xI) {
            subId.push(subDataId[i]);
            var oSpan = oMap.get(mSt);
            subSpan.push(oSpan);
            subSpanOr.push(mSt);
            subSpanCh.push(subDataCh[i]);
            
            if (subId.length > 0 && (oSpan - preSubSpan) <= 1 && ySubToggle === 0) {
                ySubsTmp.push(1);
                ySubToggle = 1;
                yMul = 1;
            } else {
                ySubsTmp.push(0);
                ySubToggle = 0;
            }
            preSubSpan = oSpan;
        }
    }
        
    // starting 1
    var ecIdx = eId + 1;
    if (D === 1) {
        ecIdx = data.xDU.length - eId;
    }
    // y axis label
    var yTick = [];
    var yText = [];   
    var yHigh = 70;
    
    var ySubs = [];
    if (yMul === 0) {
        var yExon = 30;
        var yExonTxt = "E" + ecIdx;
        yTick.push(yExon);
        yText.push(yExonTxt);
        var ySub = 70;
        var ySubTxt = ' ';
        yTick.push(ySub);
        yText.push(ySubTxt);
        
        for (var i = 0; i < ySubsTmp.length; i++) {
            ySubs.push(ySub);
            // determine y for highlighted
            if (subSpanOr[i] === highSpanO1[0]) {
                yHigh = ySub;
            }
        }
    } else {
        var yExon = 20;
        var yExonTxt = "E" + ecIdx;
        yTick.push(yExon);
        yText.push(yExonTxt);
        var ySub1 = 50;
        var ySub2 = 80;
        var ySubTxt = ' ';
        yTick.push(ySub1);
        yText.push(ySubTxt);
        yTick.push(ySub2);
        yText.push(ySubTxt);
        
        for (var i = 0; i < ySubsTmp.length; i++) {
            var ySubTg = ySub2;
            if (ySubsTmp[i] === 1) {
                ySubTg = ySub1;
            }
            ySubs.push(ySubTg);
            // determine y for highlighted
            if (subSpanOr[i] === highSpanO1[0]) {
                yHigh = ySubTg;
            }
        }
    }
        
    // do xTick normalization
    var xTick = [];
    var xTextTmp = [];   
    
    insertTick(0, mI, xTick, xTextTmp);
    insertTick(gsSt, gSt, xTick, xTextTmp);
    insertTick(sSt, st, xTick, xTextTmp);
    insertTick(sEd, ed, xTick, xTextTmp);
    insertTick(gsEd, gEd, xTick, xTextTmp);
    insertTick(100, xI, xTick, xTextTmp);
    
    var xText = [];
    xText.push(xTextTmp[0]);
    var lastTick = xTick[0];
    var lastTick2 = -5;
    for (var i = 1; i < xTick.length; i++) {
        if (lastTick + 5 < xTick[i]) {
            xText.push(xTextTmp[i]);
            lastTick = xTick[i];
        } else if (lastTick2 + 5 < xTick[i]) {
            xText.push("<br>" + xTextTmp[i]);
            lastTick2 = xTick[i];
        } else {
            xText.push("");
        }
    }
    
    // chart data
    var traces = [];

    // draw exon usage
    var xs = [];
    var ys = [];

    xs.push(xDU[0]);
    // for click event
    xs.push((xDU[0] + xDU[1])/2);
    xs.push(xDU[1]);
    ys.push(yExon);
    ys.push(yExon);
    ys.push(yExon);

    traces.push({
        x: xs,
        y: ys,

        line: {
            width: 13,
            color: '#98DBC6'
        },
        //text: ec,
        hoverinfo:'none', //text',
        mode: 'lines'
    });
    
    // draw exon usage extended to group
    var xsg = [];
    var ysg = [];

    xsg.push(xDUG[0][0]);
    xsg.push(xDUG[0][1]);
    xsg.push(xDUG[0][1]);
    xsg.push(xDUG[1][0]);
    xsg.push(xDUG[1][1]);
    xsg.push(xDUG[1][1]);
    
    ysg.push(yExon);
    ysg.push(yExon);
    ysg.push(null);
    ysg.push(yExon);
    ysg.push(yExon);
    ysg.push(null);

    traces.push({
        x: xsg,
        y: ysg,
        connectgaps: false,

        line: {
            width: 13,
            color: eColor
        },
        //text: ec,
        hoverinfo:'none', //text',
        mode: 'lines'
    });
    
    // draw snp, ment
    traces.push({
        x: subSpan,
        y: ySubs,

        marker: {
            symbol: 142,
            size: 7,
            color: sColor
        },
        text: subId,
        hoverinfo: "text",
        mode: 'markers'
    }); 
    
    var dAnnots = [{
        xref: 'paper',
        yref: 'paper',
        x: 0,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[0],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }}, {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[1],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }];  

    if ((highType === 'snp' && chartId === 'SnpChart') 
        || (highType === 'met' && chartId === 'MetChart')) {
        
        var hTick;
        var hText = highText;
        
        var yH = yHigh;
        
        // draw highlighted search term
        var xHs = [];
        var yHs = [];
        var tHs = [];

        xHs.push(highSpan1[0]);
        yHs.push(yH);
        tHs.push(highText);
        hTick = highSpan1[0];

        traces.push({
            x: xHs,
            y: yHs,

            marker: {
                symbol: 142,
                size: 7,
                color: '#66B2FF'
            },
            text: tHs,
            hoverinfo: "text",
            mode: 'markers'
        });     
        
        if (0 <= hTick && hTick <= 100) {
            dAnnots.push({
                x: hTick,
                y: 1,
                xref: 'x',
                yref: 'paper',
                yanchor: 'bottom',
                showarrow: false,
                text: hText,
                font: {
                    size: 8,
                    color: '#66B2FF'
                }
            });   
        }
    }    
    
    // set y axis height
    var cHeight = Math.max(yTick.length * 40, 100);
    
    // variable
    var cWidth = $("#taskTab1").width() * 0.9;
    // set layout
    var layout = {
        hovermode: 'closest',
        dragmode: 'pan',
        showlegend: false,
        autosize: false,
        width: cWidth,
        height: cHeight,
	paper_bgcolor: 'rgb(255, 255, 255)',
	plot_bgcolor: 'rgb(255, 255, 255)',
  
        margin: {
            l: 60,
            r: 40,
            b: 30,
            t: 30,
            pad: 0,
            autoexpand: false
        },

        xaxis: {
            autorange: false,    
            range: [0, 100],

            gridcolor: "rgba(0, 0, 0, 0.05)",
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showticklabels: true,
            tick0: 0,
            fixedrange: false,    
            zeroline: false,
	    showgrid: true,
	    
            tickvals: xTick,
	    ticktext: xText,
            
	    tickangle: 0,
	    tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },

        yaxis: {
            autorange: false,
            range: [0, 100],
            
            anchor: "x",
            linecolor: "rgba(0, 0, 0, 0.2)",
            gridcolor: "rgba(0, 0, 0, 0.05)",
            mirror: true,
            showgrid: true,
            showline: true,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: true,
            
            tickvals: yTick,
            ticktext: yText,
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },
	
        // for direction
	annotations: dAnnots
    };
    
    var myPlot = document.getElementById(chartId);
    
        // draw a plot
    Plotly.newPlot(myPlot, traces, layout, {displaylogo: false, scrollZoom: true, doubleClick: false,
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud', 
            'toImage',
            'pan2d',
            'select2d',
            'lasso2d',
            'zoom2d', 
            'hoverClosestCartesian', 
            'hoverCompareCartesian',
            'autoScale2d'
            ],
            modeBarButtonsToAdd: [{
                    name: 'Download plot as a png',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'png', width: cWidth, height: cHeight, filename: chartId});                   
                    }
                },
                {
                    name: 'Download plot as a svg',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'svg', width: cWidth, height: cHeight, filename: chartId});                   
                    }
                }
            ]            
    });

    myPlot.on('plotly_click', function(pdata){

        if (sub === "snp" && $("#sn_submit").prop('disabled') === true) {
            return;
        }
        
        var clicked = 0;
        
        var pId = "";
        var pSpan = 0;
        var pCh = 0;

        var hiID = $("#hiID").val();
        var hiPOS = $("#hiPOS").val();

        for(var i = 0; i < pdata.points.length; i++){
            var pt = pdata.points[i];
            if (pt.data.text.length > 0) { // need to be changed
                pId = pt.data.text[pt.pointNumber];
                pSpan = subSpanOr[pt.pointNumber];    
                pCh = subSpanCh[pt.pointNumber];
                clicked = 1;
            }
        }

        if (hiID === pId) {
            pSpan = hiPOS.replace("[","");
            pSpan = pSpan.replace("]","");
        }
        
        if (clicked === 1) {
            $("#" + dId).text(pId);
            if (sub === "snp") {
                $("#" + dExtra).html("chr:" + pCh + "&nbsp; &nbsp;<small>[" + pSpan + "] " 
                + "&nbsp;&nbsp;<span class='glyphicon glyphicon-new-window'></span> Link to "
                + "<a href='https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=" + pId + "' target='_blank'>" 
                + "<strong>dbSNP</strong></a></small><p></p>");
            } else {
                $("#" + dExtra).html("chr:" + pCh + "&nbsp; &nbsp;<small>[" + pSpan + "]</small><p></p>");
            }
            $("#" + hId).val(pId);
            $("#" + hSp).val(pSpan);
            
            
        } 
    });	    

}


function drawSubRNA(data, sub, chartId, dId, dExtra, hId, hSp) {
    
    var eId = $('#eId').val() * 1;
    var sc = 0;
    
    // direction
    var D = data.D;
    var dirct = [];
    setDirection(D, dirct);
    
    // get color
    var eColor = 'rgba(204, 204, 204, 1)';
    var cCode = data.xDUc[eId];
    if (cCode === 0) {
        eColor = 'rgba(156, 165, 196, 1)';
    }
    
    var cCode = data.xDUc[eId];
    
    // get new min and max span of group containing the exon
    var pEId = eId;
    for (var i = eId - 1; i >=0; i--) {
        if (cCode !== data.xDUc[i]) {
            break;
        }
        pEId = i;
    }
    var nEId = eId;
    for (var i = eId + 1; i < data.xDUc.length; i++) {
        if (cCode !== data.xDUc[i]) {
            break;
        }
        nEId = i;
    }
    
    if (cCode === 0) {
        eColor = 'rgba(156, 165, 196, 1)';
    }
    
    var st = data.xDU[eId][0];
    var ed = data.xDU[eId][1];
    
    var gSt = data.xDU[pEId][0];
    var gEd = data.xDU[nEId][1];
    
    // smallest offset   
    var mI = gSt;
    // latest offset
    var xI = gEd;
    
    // not for mir unlike snp and met
    /*
    if (pEId > 0) {
        mI = data.xDU[pEId - 1][1];
    }
    if (nEId + 1 < data.xDU.length) {
        xI = data.xDU[nEId + 1][0];
    }
    */
    
    var ra = [];
    // for offset index
    var oMap = new Map();
    getBoundary(eId, pEId, nEId, data, sc, ra, oMap);
    
    var gsSt = rNorm2(ra[1], ra[5], ra[0], 100, 0);
    var sSt = rNorm2(ra[2], ra[5], ra[0], 100, 0);
    var sEd = rNorm2(ra[3], ra[5], ra[0], 100, 0);
    var gsEd = rNorm2(ra[4], ra[5], ra[0], 100, 0);
    
    var xDU = [sSt, sEd];
    var xDUG = [[gsSt, sSt], [sEd, gsEd]];
    
    var subDataId = data.mirId;
    var subDataSpan = data.mirSpan;
    var subDataCh = data.mirCh;
    var sColor = '#BABABA';

    var highType = data.highs[0];
    var highText = data.highs[1];
    
    var highSpan1 = [];
    var highSpan2 = [];
    
    for (var i = 0; i < data.highs[2].length; i++) {
        if (data.highs[2][i] >= mI && data.highs[2][i] <= xI) {
            highSpan1.push(oMap.get(data.highs[2][i]));
            highSpan2.push(oMap.get(data.highs[3][i]));
        }
    }
    
    var subId = [];
    var subSpan = [];
    var subSpanOr = [];
    var subSpanCh = [];
    
    var ySubFs = [];
    var ySubsTmp = [];
    var subIdForH = [];
    
    var fs = 0; // 
    
    for (var i = 0; i < subDataId.length; i++) {
        var mSt = subDataSpan[i][0];
        var mEd = subDataSpan[i][1];
        
        var ch = subDataCh[i];
        
        if (mSt >= mI && mEd <= xI) {
            subId.push(subDataId[i]);
            subId.push(subDataId[i]);
            subId.push(subDataId[i]);
            subId.push('none');

            var oSpanS = oMap.get(mSt);
            var oSpanE = oMap.get(mEd);
            subSpan.push(oSpanS);
            subSpan.push((oSpanS + oSpanE) / 2);
            subSpan.push(oSpanE);
            subSpan.push(oSpanE);

            subSpanOr.push(mSt + "-" + mEd);
            subSpanOr.push(mSt + "-" + mEd);
            subSpanOr.push(mSt + "-" + mEd);
            subSpanOr.push(null);
            
            subSpanCh.push(ch);
            subSpanCh.push(ch);
            subSpanCh.push(ch);
            subSpanCh.push(null);
            
            // to set the y axis val for highlighted miRNA
            subIdForH.push(subDataId[i]);
            
            if (ySubFs.length === 0) {
                ySubFs.push(oSpanE);
                ySubsTmp.push(fs);
            } else {
                var sj = -1;
                for (var j = 0; j <= fs; j++) {
                    if ((ySubFs[j] + 0) < oSpanS) { // when space available
                        sj = j;
                        ySubFs[j] = oSpanE;
                        break;
                    }
                }
                if (sj === -1) { // need to create new level
                    fs++;
                    ySubFs[fs] = oSpanE;
                    sj = fs;
                }
                
                ySubsTmp.push(sj);
            }
        }
    }
    
    // create ticks
    // starting 1
    var ecIdx = eId + 1;
    if (D === 1) {
        ecIdx = data.xDU.length - eId;
    }
    // y axis label
    var yTick = [];
    var yText = [];   
    var ySubs = [];
    var yExon = 30;
    
    var yHigh = [];
    
    if (fs === 0) {
        var yExonTxt = "E" + ecIdx;
        yTick.push(yExon);
        yText.push(yExonTxt);
        var ySub = 70;
        var ySubTxt = ' ';
        yTick.push(ySub);
        yText.push(ySubTxt);
        
        for (var i = 0; i < ySubsTmp.length; i++) {
            ySubs.push(ySub);
            ySubs.push(ySub);
            ySubs.push(ySub);
            ySubs.push(null);
            
            if (subIdForH[i] === highText) {
                yHigh.push(ySub);
            }
        }
    } else {
        var yExonTxt = "E" + ecIdx;
        var ySubTxt = ' ';
        var fInter = 100 / (fs + 3);
        yExon = fInter;
        
        yTick.push(fInter);
        yText.push(yExonTxt);
        
        for (var i = 0; i <= fs; i++) {
            yTick.push(100 - (fInter * (i + 1)));
            yText.push(ySubTxt);
        }
        
        for (var i = 0; i < ySubsTmp.length; i++) {
            var ySub = yTick[ySubsTmp[i] + 1];
            ySubs.push(ySub);
            ySubs.push(ySub);
            ySubs.push(ySub);
            ySubs.push(null);
            
            if (subIdForH[i] === highText) {
                yHigh.push(ySub);
            }
        }
    }    
        
    // do xTick normalization
    var xTick = [];
    var xTextTmp = [];   
    
    insertTick(0, mI, xTick, xTextTmp);
    insertTick(sSt, st, xTick, xTextTmp);
    insertTick(sEd, ed, xTick, xTextTmp);
    insertTick(100, xI, xTick, xTextTmp);
    
    var xText = [];
    xText.push(xTextTmp[0]);
    var lastTick = xTick[0];
    var lastTick2 = -5;
    for (var i = 1; i < xTick.length; i++) {
        if (lastTick + 5 < xTick[i]) {
            xText.push(xTextTmp[i]);
            lastTick = xTick[i];
        } else if (lastTick2 + 5 < xTick[i]) {
            xText.push("<br>" + xTextTmp[i]);
            lastTick2 = xTick[i];
        } else {
            xText.push("");
        }
    }
    
    // chart data
    var traces = [];

    // draw exon usage
    var xs = [];
    var ys = [];

    xs.push(xDU[0]);
    // for click event
    xs.push((xDU[0] + xDU[1])/2);
    xs.push(xDU[1]);
    ys.push(yExon);
    ys.push(yExon);
    ys.push(yExon);

    traces.push({
        x: xs,
        y: ys,

        line: {
            width: 13,
            color: '#98DBC6'
        },
        //text: ec,
        hoverinfo:'none', //text',
        mode: 'lines'
    });
    
    // draw exon usage extended to group
    var xsg = [];
    var ysg = [];

    xsg.push(xDUG[0][0]);
    xsg.push(xDUG[0][1]);
    xsg.push(xDUG[0][1]);
    xsg.push(xDUG[1][0]);
    xsg.push(xDUG[1][1]);
    xsg.push(xDUG[1][1]);
    
    ysg.push(yExon);
    ysg.push(yExon);
    ysg.push(null);
    ysg.push(yExon);
    ysg.push(yExon);
    ysg.push(null);

    traces.push({
        x: xsg,
        y: ysg,
        connectgaps: false,

        line: {
            width: 13,
            color: eColor
        },
        //text: ec,
        hoverinfo:'none', //text',
        mode: 'lines'
    });    
    
    // draw miRNA
    traces.push({
        x: subSpan,
        y: ySubs,
        connectgaps: false,

        line: {
            width: 7,
            color: sColor
        },
        text: subId,
        hoverinfo: "text",
        mode: 'lines'
    }); 
   
    var dAnnots = [{
        xref: 'paper',
        yref: 'paper',
        x: 0,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[0],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }}, {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'center',
        y: 1,
        yanchor: 'bottom',
        text: dirct[1],
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 11,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }];  

    if (highType === 'mir' && chartId === 'RnaChart') {
        
        var hTick;
        var hText = highText;
        
        // draw highlighted search term
        var xHs = [];
        var yHs = [];
        var tHs = [];

        for (var i = 0; i < highSpan1.length; i++) {
            xHs.push(highSpan1[i]);
            xHs.push((highSpan1[i] + highSpan2[i])/2);
            xHs.push(highSpan2[i]);
            xHs.push(highSpan2[i]);
            
            yHs.push(yHigh[i]);
            yHs.push(yHigh[i]);
            yHs.push(yHigh[i]);
            yHs.push(null);
            
            tHs.push(highText);
            tHs.push(highText);
            tHs.push(highText);
            tHs.push('none');
        }
        hTick = (highSpan1[0] + highSpan2[0])/2;
        
        traces.push({
            x: xHs,
            y: yHs,
            connectgaps: false,

            line: {
                width: 8,
                color: '#66B2FF'
            },
            text: tHs,
            hoverinfo: "text",
            mode: 'lines'
        });     

        if ((0 <= hTick && hTick <= 100)) {
            dAnnots.push({
                x: hTick,
                y: 1,
                xref: 'x',
                yref: 'paper',
                yanchor: 'bottom',
                showarrow: false,
                text: hText,
                font: {
                    size: 8,
                    color: '#66B2FF'
                }
            });   
        }
    }    
    
    // set y axis height
    var cHeight = 100;
    if (yTick.length > 1 && yTick.length <= 4) {
        cHeight = Math.max(yTick.length * 30, 120);
    } else if (yTick.length > 4 && yTick.length <= 20) {
        cHeight = Math.max(yTick.length * 20, 150);
    } else {
        cHeight = (yTick.length * 15);
    }
    // variable
    var cWidth = $("#taskTab1").width() * 0.9;
    // set layout
    var layout = {
        hovermode: 'closest',
        dragmode: 'pan',
        showlegend: false,
        autosize: false,
        width: cWidth,
        height: cHeight,
	paper_bgcolor: 'rgb(255, 255, 255)',
	plot_bgcolor: 'rgb(255, 255, 255)',
  
        margin: {
            l: 60,
            r: 40,
            b: 30,
            t: 30,
            pad: 0,
            autoexpand: false
        },

        xaxis: {
            autorange: false,    
            range: [0, 100],

            gridcolor: "rgba(0, 0, 0, 0.05)",
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showticklabels: true,
            tick0: 0,
            fixedrange: false,    
            zeroline: false,
	    showgrid: true,
	    
            tickvals: xTick,
	    ticktext: xText,
            
	    tickangle: 0,
	    tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },

        yaxis: {
            autorange: false,
            range: [0, 100],
            
            anchor: "x",
            linecolor: "rgba(0, 0, 0, 0.2)",
            gridcolor: "rgba(0, 0, 0, 0.05)",
            mirror: true,
            showgrid: true,
            showline: true,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: true,
            
            tickvals: yTick,
            ticktext: yText,
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            },    
            titlefont: {
                family: 'sans-serif',
                size: 18,
                color: '#404040'
            }
        },
	
        // for direction
	annotations: dAnnots
    };
    
    var myPlot = document.getElementById(chartId);
    
        // draw a plot
    Plotly.newPlot(myPlot, traces, layout, {displaylogo: false, scrollZoom: true, doubleClick: false, 
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud', 
            'select2d',
            'lasso2d',
            'hoverClosestCartesian', 
            'hoverCompareCartesian',
            'autoScale2d'
            ]
    });
    
    

    myPlot.on('plotly_click', function(pdata){
        
        var clicked = 0;
        
        var pId = "";
        var pSpan = 0;
        var pCh = 0;
        
        var hiID = $("#hiID").val();
        var hiPOS = $("#hiPOS").val();

        for(var i = 0; i < pdata.points.length; i++){
            var pt = pdata.points[i];
            if (pt.data.text.length > 0) { // need to be changed
                pId = pt.data.text[pt.pointNumber];
                pSpan = subSpanOr[pt.pointNumber];
                pCh = subSpanCh[pt.pointNumber];
                clicked = 1;
            }
        }
        if (hiID === pId) {
            pSpan = hiPOS.replace("[","");
            pSpan = pSpan.replace("]","");
        }

        if (clicked === 1) {
            $("#" + dId).text(pId);
            $("#" + dExtra).html("chr:" + pCh + "&nbsp; &nbsp;<small>[" + pSpan + "]</small><p></p>");
            $("#" + hId).val(pId);
            $("#" + hSp).val(pSpan);
        } 
    });	    
}


function drawEXP(data, chartId, UID) {
    Plotly.d3.json("http://genomics.chpc.utah.edu/rs/img/"+UID+"_EXP.txt", function(figure){
        var myPlot = document.getElementById(chartId);
        var layout = figure.layout
        Plotly.newPlot(myPlot, figure.data, layout, {displaylogo: false, scrollZoom: true, doubleClick: true,
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud',
            'select2d',
            'lasso2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            ]
        });
        Plotly.addFrames(myPlot, figure.frames);
    });
}

function drawME(data, chartId, UID) {
    Plotly.d3.json("http://genomics.chpc.utah.edu/rs/img/"+UID+"_MEMI.txt", function(figure){
        var myPlot = document.getElementById(chartId);
        var layout = figure.layout
        Plotly.newPlot(myPlot, figure.data, layout, {displaylogo: false, scrollZoom: true, doubleClick: false,
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud',
            'select2d',
            'lasso2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            ]
        });
        Plotly.addFrames(myPlot, figure.frames);
    });
}

function drawMI(data, chartId, UID) {
    Plotly.d3.json("http://genomics.chpc.utah.edu/rs/img/"+UID+"_MEMI.txt", function(figure){
        var myPlot = document.getElementById(chartId);
        var layout = figure.layout
        Plotly.newPlot(myPlot, figure.data, layout, {displaylogo: false, scrollZoom: true, doubleClick: false,
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud',
            'select2d',
            'lasso2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            ]
        });
        Plotly.addFrames(myPlot, figure.frames);
    });
}

function drawSNP(data, chartId, UID) {
    Plotly.d3.json("http://genomics.chpc.utah.edu/rs/img/"+UID+"_SNP.txt", function(figure){
        var myPlot = document.getElementById(chartId);
        var layout = figure.layout
        Plotly.newPlot(myPlot, figure.data, layout, {displaylogo: false, scrollZoom: true, doubleClick: false,
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud',
            'select2d',
            'lasso2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            ]
        });
        Plotly.addFrames(myPlot, figure.frames);
    });
}

function drawOV(geneNM,chartId) {
    Plotly.d3.json("http://genomics.chpc.utah.edu/ExpData/ADAS/AD.json2/"+geneNM+".json", function(figure){
        var myPlot = document.getElementById(chartId);
        var layout = figure.layout
        Plotly.newPlot(myPlot, figure.data, layout, {displaylogo: false, scrollZoom: true, doubleClick: false,
            displayModeBar: 'false',
            modeBarButtonsToRemove:['sendDataToCloud',
            'select2d',
            'lasso2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            ]
        });
        Plotly.addFrames(myPlot, figure.frames);
        $("#loader1").css("display", "none");
    });
}

function drawCC2(data, chartId) {
    
    var grsD = ["Group A", "Group B"];

    var grsDL = ["Patient Group A", "Patient Group B"];
    
    var colorsD = ['rgba(51,143,213,0.7)', 'rgba(243,80,55,0.7)'];

    var traces = [];
    
    //bottom part
    for (var i = 0; i < grsD.length; i++) {
        var key0 = "right|" + grsD[i] + "|";
        var keyX = key0 + "l|x"; 
        var keyY = key0 + "l|y";
        
        if (keyX in data.pts && keyY in data.pts) {
        //if (data.pts.hasOwnProperty(keyX) && data.pts.hasOwnProperty(keyY)) {
            var xs = [];
            var ys = [];
            pushAll(data.pts[keyX], xs);    
            for (var j = 0; j < data.pts[keyY].length; j++) {
                ys.push(data.pts[keyY][j]);
            }
            
            traces.push({
                x: xs,
                y: ys,
                mode: 'lines',
                name: grsDL[i],
                line: {
                    shape: 'vh',
                    color: colorsD[i],
                    width: 1.2
                },
                showlegend: false, 
                legendgroup: grsDL[i],
                hoverinfo:'none',
                type: 'scatter'
            });
        }
        
        keyX = key0 + "s|x"; 
        keyY = key0 + "s|y";
        
        if (keyX in data.pts && keyY in data.pts) {
        //if (data.pts.hasOwnProperty(keyX) && data.pts.hasOwnProperty(keyY)) {
            var xs = [];
            var ys = [];
            var ts = [];
            pushAll(data.pts[keyX], xs);    
            for (var j = 0; j < data.pts[keyY].length; j++) {
                ys.push(data.pts[keyY][j]);
                ts.push('<b>' + grsDL[i] + '</b><br><b>Days:</b> ' 
                        + data.pts[keyX][j] + "<br><b>Ratio:</b> " 
                        + Math.round(data.pts[keyY][j]*1000)/10 + "%");
            }
            
            var sm = "circle";
            if (grsD[i].search("Low") !== -1) {
                sm = "triangle-up";
            }
            traces.push({
                x: xs,
                y: ys,
                mode: 'markers',
                name: grsDL[i],
                marker: {
                    symbol: sm,
                    color: colorsD[i]
                },
                showlegend: true,        
                legendgroup: grsDL[i],
                text: ts,
                hoverinfo:'text',
                type: 'scatter'
            });
        }
        
    }
        
    
    var dAnnots = [{
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'center',
        y: -0.02,
        yanchor: 'top',
        text: 'Time (in Days)',
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 8,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }, {
        xref: 'paper',
        yref: 'paper',
        x: 0,
        xanchor: 'right',
        y: 1.04,
        yanchor: 'top',
        text: 'survival<br>ratio',
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 8,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }]; 

    var cWidth = $("#taskTab1").width() * 0.9;

    var layout = {
        hovermode: 'closest',
        dragmode: 'pan',
        width: cWidth,
        height: 300,
        showlegend: true,
        legend: {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            tracegroupgap: 0,
            xanchor:"left",
            x:0.8,
            y:1,
            font: {
                family: 'sans-serif',
                size: 9
            }     
        },
        
        autosize: false,
	paper_bgcolor: 'rgb(255, 255, 255)',
	plot_bgcolor: 'rgb(255, 255, 255)',
        //title: '<b>Chart Title</b>',  
        titlefont: {
            size: 8,
            family: 'sans-serif',
            color: "rgba(0, 0, 0, 0.8)"
        },
        
        margin: {
            l: 60,
            r: 40,
            b: 40,
            t: 30,
            pad: 0,
            autoexpand: false
        },

        xaxis: {
            gridcolor: "rgba(0, 0, 0, 0.05)",
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showticklabels: true,
            tick0: 0,
            fixedrange: false,    
            zeroline: false,
	    showgrid: true,
	    tickangle: 0,
	    tickfont: {
                family: 'sans-serif',
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },

        yaxis: {
            autorange: false,
            range: [0, 1.1],
            
            anchor: "x",
            linecolor: "rgba(0, 0, 0, 0.2)",
            gridcolor: "rgba(0, 0, 0, 0.05)",
            mirror: true,
            showgrid: false,
            showline: true,
            showticklabels: true,
            tick0: 0,
            tickvals: [0, 0.25, 0.5, 0.75, 1],
            ticktext: ['0%', '25%', '50%', '75%', '100%'],
            zeroline: false,
            fixedrange: false,
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },           
        
	annotations: dAnnots
    };    

    var myPlot = document.getElementById(chartId);
    
    Plotly.newPlot(myPlot, traces, layout, {displaylogo: false, scrollZoom: true, doubleClick: false, 
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud', 
            'toImage',
            'pan2d',
            'select2d',
            'lasso2d',
            'zoom2d', 
            'hoverClosestCartesian', 
            'hoverCompareCartesian',
            'autoScale2d'
            ],
            modeBarButtonsToAdd: [{
                    name: 'Download plot as a png',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'png', filename: chartId});                   
                    }
                },
                {
                    name: 'Download plot as a svg',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'svg', filename: chartId});                   
                    }
                }
            ] 
    });
}

function drawME_RN(data, chartId, cTitle, xAxisText) {
    
    var pv1 = data.pv1.toExponential(1);
    var pv2 = data.pv2.toExponential(1);
    var pvb = data.pvb.toExponential(1);
    
    var r1 = data.r1;
    r1 = Math.round(r1*100)/100;
    var r2 = data.r2;
    r2 = Math.round(r2*100)/100;
    
    var xX1 = data.xX1;
    var xX2 = data.xX2;
    var mX1 = data.mX1;
    var mX2 = data.mX2;
    var xY1 = data.xY1;
    var xY2 = data.xY2;
    var mY1 = data.mY1;
    var mY2 = data.mY2;
            
    cTitle = "<b>" + cTitle + "</b>";
    
    var g1Id = [];
    pushAll(data.g1Id, g1Id);    
    var g1Xs = [];
    pushAll(data.g1Xs, g1Xs);    
    var g1Ys = [];
    pushAll(data.g1Ys, g1Ys);    
    var g1Hs = [];
    pushAll(data.g1Hs, g1Hs);    
    
    var g2Id = [];
    pushAll(data.g2Id, g2Id);  
    var g2Xs = [];
    pushAll(data.g2Xs, g2Xs);    
    var g2Ys = [];
    pushAll(data.g2Ys, g2Ys);   
    var g2Hs = [];
    pushAll(data.g2Hs, g2Hs);    

    var g1IdN = [];
    pushAll(data.g1IdN, g1IdN);    
    var g1XsN = [];
    pushAll(data.g1XsN, g1XsN);    
    var g1HsN = [];
    pushAll(data.g1HsN, g1HsN);
    
    var g2IdN = [];
    pushAll(data.g2IdN, g2IdN);    
    var g2XsN = [];
    pushAll(data.g2XsN, g2XsN);    
    var g2HsN = [];
    pushAll(data.g2HsN, g2HsN);
    
    var gcIdN = [];
    pushAll(data.gcIdN, gcIdN);    
    var gcXsN = [];
    pushAll(data.gcXsN, gcXsN);    
    var gcHsN = [];
    pushAll(data.gcHsN, gcHsN);
    
    var g1YSsN = [];
    var g2YSsN = [];
    var gcYSsN = [];
    
    var mY = data.mY;
    var xY = data.xY;
    
    var newXY = Math.max(xY1, xY2);
    newXY = Math.max(newXY, mY1);
    newXY = Math.max(newXY, mY2);
    xY = Math.max(newXY, xY);
    
    var newMY = Math.min(xY1, xY2);
    newMY = Math.min(newMY, mY1);
    newMY = Math.min(newMY, mY2);
    mY = Math.min(newMY, mY);

    var nMY = 110;
    var nXY = 390;
    if (mY === xY) {
        for (var i = 0; i < data.g1YSsN.length; i++) {
            g1YSsN.push(nMY);
        }
        for (var i = 0; i < data.g2YSsN.length; i++) {
            g2YSsN.push(nMY);
        }
        for (var i = 0; i < data.gcYSsN.length; i++) {
            gcYSsN.push(nMY);
        }
    } else {
        for (var i = 0; i < data.g1YSsN.length; i++) {
            g1YSsN.push(rNorm2(data.g1YSsN[i], xY, mY, nXY, nMY) + nMY);
        }
        for (var i = 0; i < data.g2YSsN.length; i++) {
            g2YSsN.push(rNorm2(data.g2YSsN[i], xY, mY, nXY, nMY) + nMY);
        }
        for (var i = 0; i < data.gcYSsN.length; i++) {
            gcYSsN.push(rNorm2(data.gcYSsN[i], xY, mY, nXY, nMY) + nMY);
        }
    }
    
    var hover = new Map();
    for (var key in data.hover) {
        var tmp = [];
        pushAll(data.hover[key], tmp);
        hover.set(key, tmp);
    }
    
    // set ticklines
    var tickVals = [];
    var tickTexts = [];
    // 390, 110, 0.52, 0.51
    setTicks(nXY, nMY, xY, mY, tickVals, tickTexts);
        
    var boxBgy = 40;
    var boxAgy = 90;
    
    var trBoxA = {
        x: g1Xs,
        y0: boxAgy,
        name: 'Patient Group A',
        boxpoints: 'Outliers',        
        hoverinfo: "skip",
        marker: {
            color: 'rgba(255,255,255,0)',
            line: {
                color: 'rgba(255,255,255,0)'
            }
        },
        line: {
            color: '#C2E6EC'
        },
        showlegend: false,        
        legendgroup: '0',
        type: 'box'
    };

    var trBoxB = {
        x: g2Xs,
        y0: boxBgy,
        name: 'Patient Group B',
        boxpoints: 'Outliers',        
        hoverinfo: "skip",
        marker: {
            color: 'rgba(255,255,255,0)',
            line: {
                color: 'rgba(255,255,255,0)'
            }
        },
        line: {
            color: '#F2D2CE'
        },
        showlegend: false,        
        legendgroup: '0',
        type: 'box'
    };

    var trScaA = {
        x: g1Xs,
        y: g1Ys,
        mode: 'markers',
        marker: {
            color: 'rgba(51,143,213,0.7)'
        },
        text: g1Hs,
        hoverinfo:'text',
        showlegend: false,        
        legendgroup: '0',
        type: 'scatter'
    };

    var trScaB = {
        x: g2Xs,
        y: g2Ys,
        mode: 'markers',
        marker: {
            color: 'rgba(243,80,55,0.7)'
        },
        text: g2Hs,
        hoverinfo:'text',
        showlegend: false,        
        legendgroup: '0',
        type: 'scatter'
    };

    var trScaA2 = {
        x: g1XsN,
        y: g1YSsN,
        name: 'Patient Group A',
        mode: 'markers',
        marker: {
            color: 'rgba(51,143,213,0.7)'
        },
        text: g1HsN,
        hoverinfo:'text',
        showlegend: true,        
        legendgroup: 'a',
        type: 'scatter'
    };

    var trScaB2 = {
        x: g2XsN,
        y: g2YSsN,
        name: 'Patient Group B',
        mode: 'markers',
        marker: {
            color: 'rgba(243,80,55,0.7)'
        },
        text: g2HsN,
        hoverinfo:'text',
        showlegend: true,        
        legendgroup: 'b',
        type: 'scatter'
    };
    
    // commons
    var trScaC = {
        x: gcXsN,
        y: gcYSsN,
        name: 'Common',
        mode: 'markers',
        marker: {
            color: 'rgba(78,222,68,0.7)'
        },
        text: gcHsN,
        hoverinfo:'text',
        showlegend: true,        
        legendgroup: 'c',
        type: 'scatter'
    };
    
    var traces = [trBoxA, trBoxB, trScaA, trScaB];
    
    // draw trend lines
    // if group1 and group2 are same draw one common line
    
    if (xX1 === xX2 && mX1 === mX2 && xY1 === xY2 && mY1 === mY2) {
        traces.push({
            x: [mX2, xX2],
            y: [rNorm2(mY2, xY, mY, nXY, nMY) + nMY, rNorm2(xY2, xY, mY, nXY, nMY) + nMY],
            name: 'Common',
            line: {
                color: 'rgba(78,222,68,0.95)',
                width: 2
            },
            showlegend: false,        
            legendgroup: 'c',
            hoverinfo:'none',
            mode: 'lines'
        });        
    } else {
        if (g1XsN.length > 0) {
            traces.push({
                x: [mX1, xX1],
                y: [rNorm2(mY1, xY, mY, nXY, nMY) + nMY, rNorm2(xY1, xY, mY, nXY, nMY) + nMY],
                name: 'Patient Group A',
                line: {
                    color: 'rgba(194,230,236, 0.95)',
                    width: 2
                },
                showlegend: false,  
                legendgroup: 'a',
                hoverinfo:'none',
                mode: 'lines'
            });
        }
        
        if (g2XsN.length > 0) {
            traces.push({
                x: [mX2, xX2],
                y: [rNorm2(mY2, xY, mY, nXY, nMY) + nMY, rNorm2(xY2, xY, mY, nXY, nMY) + nMY],
                name: 'Patient Group B',
                line: {
                    color: 'rgba(242,210,206, 0.95)',
                    width: 2
                },
                showlegend: false,  
                legendgroup: 'b',
                hoverinfo:'none',
                mode: 'lines'
            });
        }
    }
    
    traces = traces.concat([trScaA2, trScaB2, trScaC]);
    
    var dAnnots = [{
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'center',
        y: 0,
        yanchor: 'top',
        text: xAxisText,
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 8,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }, {
        xref: 'paper',
        yref: 'paper',
        x: 0,
        xanchor: 'right',
        y: 1,
        yanchor: 'middle',
        text: 'Ratio',
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 8,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }, {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'right',
        y: 0,
        yanchor: 'bottom',
        text: '<b><i>p</i> value:</b> ' + pvb,
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 10,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }, {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'right',
        y: 1,
        yanchor: 'top',
        text: '<b>Patient Group A\'s <i>p</i> value:</b> ' + pv1 
                + ', <b>R-squared value:</b>' + r1
                + '<br><b>Patient Group B\'s <i>p</i> value:</b> ' + pv2
                + ', <b>R-squared value:</b>' + r2,
        showarrow: false,
        font: {
            family: 'sans-serif',
            size: 10,
            color: "rgba(0, 0, 0, 0.9)"
        }
    }];  

    
    var cWidth = $("#taskTab1").width() * 0.9;
    var cYMax = 400;
    
    var layout = {
        hovermode: 'closest',
        dragmode: 'pan',
        width: cWidth,
        height: 500,
        showlegend: true,
        legend: {"orientation": "h", "traceorder":"grouped"},

        autosize: false,
	paper_bgcolor: 'rgb(255, 255, 255)',
	plot_bgcolor: 'rgb(255, 255, 255)',
        boxgap: 0.8,
        title: cTitle,  
        titlefont: {
            size: 16,
            family: 'sans-serif',
            color: "rgba(0, 0, 0, 0.8)"
        },
        
        margin: {
            l: 60,
            r: 40,
            b: 40,
            t: 30,
            pad: 0,
            autoexpand: false
        },

        xaxis: {
            gridcolor: "rgba(0, 0, 0, 0.05)",
            linecolor: "rgba(0, 0, 0, 0.2)",
            mirror: true,
            showticklabels: true,
            tick0: 0,
            fixedrange: false,    
            zeroline: false,
	    showgrid: true,
	    tickangle: 0,
	    tickfont: {
                family: 'sans-serif',
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },

        yaxis: {
            autorange: false,
            range: [0, cYMax],
            
            anchor: "x",
            linecolor: "rgba(0, 0, 0, 0.2)",
            gridcolor: "rgba(0, 0, 0, 0.1)",
            mirror: true,
            showgrid: true,
            showline: true,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: false,
            
            tickvals: tickVals,
            ticktext: tickTexts,
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },
        
        yaxis2: {
            autorange: false,
            range: [0, cYMax],
            
            anchor: "x",
            mirror: true,
            showgrid: false,
            showline: false,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: false,
            
            overlaying: 'y',
            side: 'left',            
            
            tickvals: [boxAgy, boxBgy],
            ticktext: ['Patient <br>Group A', 'Patient <br>Group B'],
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },    

        yaxis3: {
            autorange: false,
            range: [0, cYMax],
            
            anchor: "x",
            gridcolor: "rgba(0, 0, 0, 0.2)",
            gridwidth: 2,
            
            mirror: true,
            showgrid: true,
            showline: false,
            showticklabels: true,
            tick0: 0,
            zeroline: false,
            fixedrange: false,
            
            overlaying: 'y',
            side: 'left',            
            
            tickvals: [100],
            ticktext: [''],
            
            tickfont: {
                size: 8,
                color: "rgba(0, 0, 0, 0.8)"
            }
        },   
        
	annotations: dAnnots
    };    

    var myPlot = document.getElementById(chartId);
    
    Plotly.newPlot(myPlot, traces, layout, {displaylogo: false, scrollZoom: true, doubleClick: false, 
            displayModeBar: 'true',
            modeBarButtonsToRemove:['sendDataToCloud', 
            'toImage',
            'pan2d',
            'select2d',
            'lasso2d',
            'zoom2d', 
            'hoverClosestCartesian', 
            'hoverCompareCartesian',
            'autoScale2d'
            ],
            modeBarButtonsToAdd: [{
                    name: 'Download plot as a png',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'png', filename: chartId});                   
                    }
                },
                {
                    name: 'Download plot as a svg',
                    icon: Plotly.Icons['camera'],
                    click: function() {
                        Plotly.downloadImage(myPlot, {format: 'svg', filename: chartId});                   
                    }
                }
            ]            
    });
    
    myPlot.on('plotly_hover', function (eventdata){
        var points = eventdata.points[0];
        var pNum = points.pointNumber;
        var curveNum = points.curveNumber;
        
        var idH;
        
        var offset = traces.length;
        
        if (curveNum  === 2){
            idH = hover.get(g1Id[pNum]);
        } else if (curveNum  === 3){
            idH = hover.get(g2Id[pNum]);
        } else if (curveNum  === offset - 3){
            idH = hover.get(g1IdN[pNum]);
        } else if (curveNum  === offset - 2){
            idH = hover.get(g2IdN[pNum]);
        } else if (curveNum  === offset - 1){
            idH = hover.get(gcIdN[pNum]);
        } else {
            return;
        } 
        
        var hArr = [];
        for (var i = 0; i <= 4 ; i++) {
            if (idH[i] !== -1) {
                if (i < 2) {
                    hArr.push({ curveNumber:(i + 2), pointNumber:idH[i] });
                } else {
                    hArr.push({ curveNumber:(offset + i - 5), pointNumber:idH[i] });
                }
            }
        }
        Plotly.Fx.hover(chartId, hArr);
    });    
}



function getBoundary(eId, pEId, nEId, data, sc, ra, oMapT) {
        // get percentages of eT and iT
    var eT = (data.eT * 100) / (data.xI - data.mI - 1000);
    var iT = (data.iT * 100) / (data.xI - data.mI - 1000);
    
    var esc = ( 1 + ((iT * (1 - sc)) / eT));
    var fSt = 0;  // following start
    
    var gsSt = 0; // group start
    var esSt = 0; // exon start
    var esEd = 0; // exon end
    var gsEd = 0; // group end
    
    var sSt = 0;
    var sEd = 0;
    
    var pEd = 0; // previous end
    
    var oMap = new Map();
    var keys = [];
    
    for (var i = 0; i <= nEId; i++) {
        var st = rNorm(data.xDU[i][0], data.xI, data.mI - 1000);
        var ed = rNorm(data.xDU[i][1], data.xI, data.mI - 1000);
        
        var nSt = 100;
        if (i + 1 < data.xDU.length) {
            nSt = rNorm(data.xDU[i + 1][0], data.xI, data.mI - 1000);
        }
        // exon ans intron scaling
        var lenE = (ed - st) * esc;
        var lenI = (nSt - ed) * sc; // for next
                
        // set new scaled span
        sSt = fSt;
        sEd = sSt + lenE;
        
        if (i >= pEId) {
            for (var j = data.xDU[i][0]; j <= data.xDU[i][1]; j++) {
                oMap.set(j, sSt + rNorm2(j, data.xDU[i][1], data.xDU[i][0], sEd, sSt));
                keys.push(j);
            }
        }
        
        if (i === pEId) {
            gsSt = sSt;
        }
        if (i === nEId) {
            gsEd = sEd;
        }
        if (i === eId) {
            esSt = sSt;
            esEd = sEd;
        }
        if (i === pEId - 1) {
            pEd = sEd;
        }
        
        fSt = sEd + lenI;
        
        // boundary points are not correct
        // snp met not displayed
        
        if ((i >= pEId - 1) && (i <= nEId) && ((i + 1) < data.xDU.length)) {
            for (var j = data.xDU[i][1]; j <= data.xDU[i + 1][0]; j++) {
                oMap.set(j, sEd + rNorm2(j, data.xDU[i + 1][0], data.xDU[i][1], fSt, sEd));
                keys.push(j);
            }
        }
    }
    
    ra.push(pEd);
    ra.push(gsSt);
    ra.push(esSt);
    ra.push(esEd);
    ra.push(gsEd);
    ra.push(fSt);
    
    for (var i in keys) {
        oMapT.set(keys[i], rNorm2(oMap.get(keys[i]), ra[5], ra[0], 100, 0));
    }    
}

function cm(a, b, val){
    var aC = a*val;
    var bC = b*(1-val);
    return parseInt(aC+bC);
}

function cMix(min, max, mid){    
    var a = [255,0,0]; // red
    var b = [230,230,230]; // gray
    
    var val = (mid - min) / max;
    
    var r = cm(a[0], b[0], val);
    var g = cm(a[1], b[1], val);
    var b = cm(a[2], b[2], val);
    return "rgb("+r+","+g+","+b+")";
}
        
window.onresize = function() {
    //alert($(window).width());
    updateSize("MainChart");
    
    updateSizeSub("MetChart", "taskTab1");
    updateSizeSub("SnpChart", "taskTab1");
    updateSizeSub("RnaChart", "taskTab1");    
    
    updateSizeSub("RTChart", "taskTab1");
    updateSizeSub("ICChart", "taskTab1");
    updateSizeSub("expChart", "taskTab1");
    updateSizeSub("CCChart", "taskTab1");    
    updateSizeSub("CCChart2", "taskTab1");

    
    updateSizeSub("MEChart", "taskTab1");    
    updateSizeSub("RNChart", "taskTab1");   
};

function updateSize(id){
    var cWidth = $("#" + id).parent().width()*0.9;
    var update = {
	width: cWidth
    };
    Plotly.relayout(id, update);
}

function updateSizeSub(id, pid){
    var cWidth = $("#" + pid).width()*0.9;
    
    var myPlot = document.getElementById(id);
    if (myPlot.data === null || myPlot.data === undefined) {
        return;
    }
    var update = {
        width: cWidth
    };
    Plotly.relayout(id, update);
}

function insertTick(tick, text, tickArray, textArray){

    if (tickArray.indexOf(tick) < 0) {
        tickArray.push(tick);
        textArray.push(text);
    }
}    
    
function setDirection(d, dirct) {
    if (d === 1) {
        dirct.push('-');
        dirct.push('+');
    } else {
        dirct.push('+');
        dirct.push('-');
    }
}
    
     // 390, 110, 0.52, 0.51
function setTicks(nXY, nMY, xY, mY, tickVals, tickTexts) {

    var f = 2;
    var tMY = Number(mY).toFixed(f);
    var tnMY = rNorm2(tMY, xY, mY, nXY, nMY) + nMY;
    tickTexts.push(tMY);
    tickVals.push(tnMY);

    var mid = Number((mY + xY) / 2).toFixed(f);
    var midN = rNorm2((mY + xY) / 2, xY, mY, nXY, nMY) + nMY;
    if (tMY !== mid) {
        tickTexts.push(mid);
        tickVals.push(midN);
    }

    var tXY = Number(xY).toFixed(f);
    var tnXY = rNorm2(tXY, xY, mY, nXY, nMY) + nMY;
    if (tMY !== tXY) {
        tickTexts.push(tXY);           
        tickVals.push(tnXY);
    }
}
