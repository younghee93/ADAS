<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ADAS-viewer</title>

        <style>
            #loader1 {
                position:relative;
                bottom:80%;
            }
            #loader2 {
                position:relative;
                left:45%;
                top:100%;
            }
            #loader3 {
                position:relative;
                left:45%;
                top:100%;
            }
            #loader4 {
                position:relative;
                left:45%;
                top:100%;
            }
            #loader5 {
                position:relative;
                left:45%;
                top:100%;
            }
        </style>


        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link href="css/bootstrap-slider.min.css" rel="stylesheet">
        <link href="css/main.css" rel="stylesheet">

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->

        <script src="js/jquery.min.js"></script>
        <script src="js/bootstrap.min.js"></script>
	<script src="js/bootstrap-slider.min.js"></script>
	<script src="js/listgroup.min.js"></script>
        
        <script src="js/plotly-latest.min.js"></script>
	<script src="js/chart.js"></script>
        <link href="https://gitcdn.github.io/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css" rel="stylesheet">
        <script src="https://gitcdn.github.io/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min.js"></script>

	<script src="js/ready.js"></script>
	<script src="https://d3js.org/d3.v5.min.js"></script>

	<script type="text/javascript">
            var cdata = ${cJson};
            $("#MainChart").ready(function() {
		drawMain(cdata, 0);
            });
	</script>

        <script type="text/javascript">
            var urlid = "${fn:toUpperCase(geneTxt)}";
            $("#OVChart").ready(function() {
                drawOV(urlid,"OVChart");
            });
        </script>

    </head>
    <body>
        <div class="container">
	  <nav class="navbar navbar-default noradius">
	    <!-- Brand and toggle get grouped for better mobile display -->
	    <div class="navbar-header">
	      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-navbar-collapse-1" aria-expanded="false">
		<span class="sr-only">Toggle navigation</span>
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
		<span class="icon-bar"></span>
	      </button>
              <a class="navbar-brand" href="/AD"><img src="img/logo_main.png" alt="ADAS-Viewer"></a>
	    </div>
	    <!-- Collect the nav links, forms, and other content for toggling -->
	    <div class="collapse navbar-collapse" id="main-navbar-collapse-1">
		<form class="navbar-form navbar-right" action="/AD/list" id="searchForm" method="post">
		    <div class="form-group">
			<span class="input-group">
			    <input type="text" class="form-control" placeholder="Search.." id="sTerm" name="sTerm" value=${fn:toUpperCase(geneTxt)}><span class="input-group-btn"><button type="submit" class="btn btn-primary"><span class="glyphicon glyphicon-search"></span></button></span>
                        </span>
                        <input type="hidden" id="sTermH" name="sTermH" value=${geneTxt}>
                        <input type="hidden" id="uid" name="uid" value=${uid}>
                        <input type="hidden" id="pos" name="pos" value=${chromTxt}>
                        <input type="hidden" id="hiID" name="hiID" value=${cJson.highs[1]}>
                        <input type="hidden" id="hiPOS" name="hiPOS" value=${cJson.highs[2]}>
                        <input type="hidden" id="SNPch" name="SNPch" value=${cJson.snpCh[0]}>
		    </div>
		</form>
	    </div><!-- /.navbar-collapse -->
          </nav>
	</div><!-- /.container -->

	<div class="container">
	    <div>
                <span class="input-group">
                    <strong>${fn:toUpperCase(geneTxt)}</strong> chr:${chromTxt} <small>[${cJson.mI}-${cJson.xI}]</small>
                    &nbsp;&nbsp;<small><span class='glyphicon glyphicon-new-window'></span> Link to <a href='http://www.genenames.org/cgi-bin/search?search_type=all&submit=Submit&search=${fn:toUpperCase(geneTxt)}' target='_blank'><strong>HUGO</strong></a></small>
                    &nbsp;<small><a href='http://www.genecards.org/cgi-bin/carddisp.pl?gene=${fn:toUpperCase(geneTxt)}' target='_blank'><strong>GeneCards</strong></a></small>
                </span>
	    </div>
            <div id="MainChart" align="center">
                <input type="hidden" id="eId" name="eId" value='-1'>
                <input type="hidden" id="cN" name="cN" value='-1'>
                <input type="hidden" id="eIdColor" name="eIdColor" value='none'>
		<!-- Plotly chart will be drawn inside this DIV -->
            </div>
            <center>
	    <div class="panel panel-default noborder">
		<div class="panel-body">
                    <span class="input-group">
                        <span id="sliderLabel1"><string>Intron scaling</string>&nbsp; &nbsp;&nbsp;</span>
                        <input id="slider1" data-slider-id="slider1i" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="0" data-slider-handle="square" data-slider-tooltip="hide"/>
                    <span id="slider1Val" class="text-primary scale_place">0</span> %
                    </span>
		</div>
	    </div>
        </center>
	</div>



        <div class="container">
            <div id="exp1">
                <ul class="nav nav-tabs">
                    <li class="active">
                        <a href="#E1" data-toggle="tab"><strong>Transcript expression in brain regions</strong></a>
                    </li>
                    <li>
                         <a href="#E2" data-toggle="tab"><strong>Analysis</strong></a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane active" id="E1">
                        <center>
                        <div id="loader1" class="loader"></div> 
                        </center>
                        <div align="center" id="OVChart" alt="Loading" scrolling="no" seamless="seamless" frameBorder="0"></div>
                        <br><br><br><br>
                    </div>
                <div class="tab-pane" id="E2">
                <div style="color:red">
                <FONT SIZE="3">
                <p>&nbsp; &nbsp;<small><span class="glyphicon glyphicon-arrow-up"></span> Step1. Click an Exon in the <span class="text-primary">Exon Usage</span> row to display transcripts with and w/o skipping</small></p>
                </div></FONT>


        <div class="codntainer">
            <div class="container"><h4><span data-toggle="collapse" data-target="#opTab1"><button type="button" class="btn btn-default btn-xs cancer-tab-toggle"><span class="glyphicon glyphicon-minus"></span></button></span>Option</h4>
            <div id="opTab1" class="collapse in">
                <div id="opTab2">
                <ul class="nav nav-tabs">
                    <li class="active">
                        <a href="#o1" data-toggle="tab" id="opTab1o1"><strong>Step2. Select transcripts</strong></a>
                    </li>
                    <li>
                        <a href="#o2" data-toggle="tab"><strong>Step3. Select a cases</strong></a>
                    </li>
                    <li class="dropdown">
                        <a href="#" id="opTabDrop1" class="dropdown-toggle" data-toggle="dropdown">
                            <strong>More </strong><b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu" role="menu" aria-labelledby="opTabDrop1">
                          <li><a href="#o2" tabindex="-1" data-toggle="tab"><strong>Step3. Select a cases</strong></a></li>
                        </ul>
                    </li>
                </ul>
</div>

                <div class="tab-content">
                    <div class="tab-pane active" id="o1">
                        <FONT SIZE="3">
                        <div style="color:red">
                            <p id = 'tInfo' class='hidden'><small><span class="glyphicon glyphicon-arrow-down"></span> Step2. Click the transcript to unselect or select. Click <span class="glyphicon glyphicon-menu-right"></span> or <span class="glyphicon glyphicon-menu-left"></span> to re-group the transcript
                            </small></p>
                        </div>
                        </FONT>

                        <div class="row">
                            <div class="col-xs-6 col-md-4 col-md-offset-2">
                                <p></p>
                                <p id = 'twoHeader' class="hidden"><strong><small>Transcripts without Exon Skipping</small></strong> &nbsp;
                                <c:set var="num_yt" value="${fn:length(cJson.yt)}"/>
                                <button class="btn btn-default btn-xs btn-all enst-sel-a" data-toggle="tooltip" data-placement="top" title="Select All"><span class="glyphicon glyphicon-ok"></span></button>
                                <button class="btn btn-default btn-xs btn-none enst-sel-a" data-toggle="tooltip" data-placement="top" title="Select None"><span class="glyphicon glyphicon-ok"></span></button>
                                </p>
                                <div class="list-group" data-toggle="items">
                                    <c:forEach items="${cJson.yt}" varStatus="loop">
                                        <div class="list-group-item list-group-item-narrow btn-sm btn-op1 hidden enst-each-a active" enst_attr="${num_yt - loop.count}">${cJson.yt[num_yt - loop.count].toUpperCase()}<span class="enst-each-move enst-each-move-a" data-toggle="tooltip" data-placement="top" title="Move to Transcript with Exon Skipping"><span class="glyphicon glyphicon-menu-right"></span></span></div>
                                    </c:forEach>
                                </div>
                            </div>
                            <div class="col-xs-6 col-md-4">
                                <p></p>
                                <p id = 'twHeader' class="hidden"><strong><small>Transcripts with Exon Skipping</small></strong> &nbsp;
                                <button class="btn btn-default btn-xs btn-all enst-sel-b" data-toggle="tooltip" data-placement="top" title="Select All"><span class="glyphicon glyphicon-ok"></span></button>
                                <button class="btn btn-default btn-xs btn-none enst-sel-b" data-toggle="tooltip" data-placement="top" title="Select None"><span class="glyphicon glyphicon-ok"></span></button>
                                </p>
                                <div class="list-group" data-toggle="items">
                                    <c:forEach items="${cJson.yt}" varStatus="loop">
                                        <div class="list-group-item list-group-item-narrow btn-sm btn-op1 hidden enst-each-b active" enst_attr="${num_yt - loop.count}">${cJson.yt[num_yt - loop.count].toUpperCase()}<span class="enst-each-move enst-each-move-b" data-toggle="tooltip" data-placement="top" title="Move to Transcript without Exon Skipping"><span class="glyphicon glyphicon-menu-left"></span></span></div>
                                    </c:forEach>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="o2">
                        <FONT SIZE="3">
                        <div style="color:red">
                            <p id = 'gInfo'><small><span class="glyphicon glyphicon-arrow-down"></span> Step3. Separate the samples to define groups</small></p>
                        </div>
                        </FONT>
                        <div class="row">
                            <div class="col-md-2">
                                <p><strong><small><span class="glyphicon glyphicon-list"></span> Brain regions</small></strong></p>
                                <div class="list-group scroll_left">
                                    <c:forEach var="row" items="${cancermenu}" varStatus="loop">
                                        <c:choose>
                                            <c:when test="${loop.index == 0}">
                                                <button id = "cancer_${row.cType}" type="button" class="list-group-item btn-md btn-op1 cancer_vtab text-capitalize active" data-toggle="tooltip" data-placement="right" title="${row.cLong}"><strong>${row.cType}</strong></button>
                                            </c:when>
                                            <c:otherwise>
                                                <button id = "cancer_${row.cType}" type="button" class="list-group-item btn-md btn-op1 cancer_vtab text-capitalize" data-toggle="tooltip" data-placement="right" title="${row.cLong}"><strong>${row.cType}</strong></button>
                                            </c:otherwise>
                                        </c:choose>
                                    </c:forEach>
                                </div>
                            </div>

                            <div class="col-md-8">
                                <c:forEach var="row" items="${cancermenu}" varStatus="loop">
                                    <c:choose>
                                        <c:when test="${loop.index == 0}">
                                            <div id = "cancer_${row.cType}_content">
                                        </c:when>
                                        <c:otherwise>
                                            <div id = "cancer_${row.cType}_content" class="hidden">
                                        </c:otherwise>
                                    </c:choose>

                                        <table class="table table-condensed">
                                            <colgroup>
                                                <col class="col-xs-4 col-md-4">
                                                <col class="col-xs-2 col-md-2">
                                                <col class="col-xs-2 col-md-2">
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th style="border:none;"></th>
                                                    <th class="text-center" style="border:none;"><small>Case Group A</small></th>
                                                    <th class="text-center" style="border:none;"><small>Case Group B</small></th>
                                                </tr>
                                                <tr>
                                                    <th style="border-top:none;"><button type="button" class="btn btn-default btn-xs cancer-op-toggle-all" data-toggle="tooltip" data-placement="top" title="Expand All"><span class="glyphicon glyphicon-plus"></span></button></th>
                                                    <th style="border-top:none;" class="text-center">
                                                        <button class="btn btn-default btn-xs btn-all cancer-a" data-toggle="tooltip" data-placement="top" title="Select All"><span class="glyphicon glyphicon-ok"></span></button>
                                                        <button class="btn btn-default btn-xs btn-none cancer-a" data-toggle="tooltip" data-placement="top" title="Select None"><span class="glyphicon glyphicon-ok"></span></button>
                                                    </th>
                                                    <th style="border-top:none;" class="text-center">
                                                        <button class="btn btn-default btn-xs btn-all cancer-b" data-toggle="tooltip" data-placement="top" title="Select All"><span class="glyphicon glyphicon-ok"></span></button>
                                                        <button class="btn btn-default btn-xs btn-none cancer-b" data-toggle="tooltip" data-placement="top" title="Select None"><span class="glyphicon glyphicon-ok"></span></button>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                <c:forEach var="op_h" items="${row.op}" varStatus="oloop">
                                                    <tr class="active">
                                                        <td class="cancer_fcap cancer_op_h"><span data-toggle="collapse" data-target=".${row.cType}_${oloop.index}"><button type="button" class="btn btn-default btn-xs cancer-op-toggle"><span class="glyphicon glyphicon-plus"></span></button></span><span class="cancer_cap">${op_h}</span></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                    <c:forEach var="op_h_val" items="${row.opVal[oloop.index]}">
                                                        <tr class="collapse ${row.cType}_${oloop.index}">
                                                            <td class="cancer_fcap cancer_indent"><small>${op_h_val}</small></td>
                                                            <td class="text-center"><button type="button" class="btn btn-default btn-xs btn-op2 cancer_${row.cType}_option_a active" data-toggle="button"><span class="glyphicon glyphicon-ok"></span></button></td>
                                                            <td class="text-center"><button type="button" class="btn btn-default btn-xs btn-op2 cancer_${row.cType}_option_b active" data-toggle="button"><span class="glyphicon glyphicon-ok"></span></button></td>
                                                        </tr>
                                                    </c:forEach>
                                                </c:forEach>

                                            </tbody>
                                        </table>
                                    </div>
                                </c:forEach>
                                <!-- content for end -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container"><h4>Result&nbsp&nbsp&nbsp&nbsp&nbsp<input id="toggle-event" type="checkbox" checked data-toggle="toggle" data-onstyle="success" data-width="170" data-offstyle="primary" data-on="Transcript Ratio" data-off="Transcript Expression"></h4>
            <div id="taskTab1">
                <ul class="nav nav-tabs">
                    <li class="active">
                        <a href="#t1" data-toggle="tab"><strong>Comparisons</strong></a>
                    </li>
                    <li>
                        <a href="#t5" data-toggle="tab" id="taskTab1Snp"><strong>SNP</strong></a>
                    </li>
                    <li>
                        <a href="#t3" data-toggle="tab" id="taskTab1Met"><strong>Methylation</strong></a>
                    </li>
                    <li>
                        <a href="#t4" data-toggle="tab" id="taskTab1Rna"><strong>miRNA</strong></a>
                    </li>

                    <li class="dropdown">
                        <a href="#" id="taskTabDrop1" class="dropdown-toggle" data-toggle="dropdown">
                            <strong>More </strong><b class="caret"></b>
                        </a>
                        <ul class="dropdown-menu" role="menu" aria-labelledby="taskTabDrop1">
                          <li>
                              <a href="#t5" tabindex="-1" data-toggle="tab"><strong>SNP</strong></a>
                          </li>
                          <li>
                              <a href="#t3" tabindex="-1" data-toggle="tab"><strong>Methylation</strong></a>
                          </li>
                          <li>
                              <a href="#t4" tabindex="-1" data-toggle="tab"><strong>miRNA</strong></a>
                          </li>
                        </ul>
                    </li>

                </ul>
                <div class="tab-content">
                    <div class="tab-pane active" id="t1">
                        <p></p>
                        <button type="button" id = "exp_submit" class="btn btn-default">Analysis</button>
                        <%--id : ${uid} --%>
                        <p></p>
                        <div id="exp_wait" class="wait">
                            <div id="loader2" class="loader"></div>
                        </div>
                            <div id="EXPChart" align="center">
                        </div>
                        <p></p>
                        <div id="exp-p-val" class="text-center"></div>

                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <div id="exp-options" class="hidden">
                                    <table class="table table-condensed">
                                        <colgroup>
                                            <col class='col-xs-2 col-md-2'>
                                            <col class='col-xs-6 col-md-6'>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group A</strong></small></td>
                                                <td id="exp-options-td-a"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group B</strong></small></td>
                                                <td id="exp-options-td-b"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td></td>
                                                <td><small><span class="text-right notbold-right"><sup><span class="glyphicon glyphicon-asterisk"></span></sup>Options selected by both groups appear in <strong><span class='text-primary'>boldface</span></strong>.</span></small></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <p></p>
                    </div>
                        <div class="tab-pane" id="t3">
                        <p></p>
                        <div style="color:red">
                            <p>&nbsp; &nbsp;<small><span class="glyphicon glyphicon-arrow-down"></span> Click the red bar to select methylation, then click Analysis to proceed the test.
                            </small></p>
                        </div>
                        <p>
                        <div id="MetChart" align="center"></div>
                        <button type="button" id = "me_submit" class="btn btn-default">Analysis</button>
                        <%--id : ${uid} --%>
                        <p></p>
                        <input type="hidden" id="meId" name="meId">
                        <input type="hidden" id="meSp" name="meSp">

                        <p></p>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <strong><span id="met-selected" class="itemId_place"></span></strong><span id="me-result"></span>
                            </div>
                        </div>

                        <div id="me_wait" class="wait">
                            <div id="loader3" class="loader"></div>
                        </div>
                            <div id="MEChart" align="center">
                        </div>
                        <p></p>
                        <div id="me-p-val" class="text-center"></div>

                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <div id="me-options" class="hidden">
                                    <table class="table table-condensed">
                                        <colgroup>
                                            <col class='col-xs-2 col-md-2'>
                                            <col class='col-xs-6 col-md-6'>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group A</strong></small></td>
                                                <td id="me-options-td-a"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group B</strong></small></td>
                                                <td id="me-options-td-b"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td></td>
                                                <td><small><span class="text-right notbold-right"><sup><span class="glyphicon glyphicon-asterisk"></span></sup>Options selected by both groups appear in <strong><span class='text-primary'>boldface</span></strong>.</span></small></td>
                                            </tr>
                                        </tbody>
                                 </table>
                                </div>
                            </div>
                        </div>
                        <p></p>
                    </div>

                    <div class="tab-pane" id="t4">
                        <p></p>
                        <div style="color:red">
                            <p>&nbsp; &nbsp;<small><span class="glyphicon glyphicon-arrow-down"></span> Click the one miRNA, then click Analysis to proceed the test.
                            </small></p>
                        </div>
                        <p>
                        <div id="RnaChart" align="center"></div>
                        <button type="button" id = "rn_submit" class="btn btn-default">Analysis</button>
                        <%--id : ${uid} --%>
                        <p></p>
                        <input type="hidden" id="rnId" name="rnId">
                        <input type="hidden" id="rnSp" name="rnSp">
                        <p></p>

                        <p></p>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <strong><span id="rna-selected" class="itemId_place_rna"></span></strong><span id="rn-result"></span>
                            </div>
                        </div>

                        <div id="rn_wait" class="wait">
                            <div id="loader4" class="loader"></div>
                        </div>
                        <div id="RNChart" align="center">
                        </div>
                        <p></p>
                        <div id="rn-p-val" class="text-center"></div>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <div id="rn-options" class="hidden">
                                    <table class="table table-condensed">
                                        <colgroup>
                                            <col class='col-xs-2 col-md-2'>
                                            <col class='col-xs-6 col-md-6'>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group A</strong></small></td>
                                                <td id="rn-options-td-a"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group B</strong></small></td>
                                                <td id="rn-options-td-b"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td></td>
                                                <td><small><span class="text-right notbold-right"><sup><span class="glyphicon glyphicon-asterisk"></span></sup>Options selected by both groups appear in <strong><span class='text-primary'>boldface</span></strong>.</span></small></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <p></p>

                    </div>



                    <div class="tab-pane" id="t5">
                        <p></p>
                        <div style="color:red">
                            <p>&nbsp; &nbsp;<small><span class="glyphicon glyphicon-arrow-down"></span> Click a SNP for details.
                            </small></p>
                        </div>
                        <p>
                        <div id="SnpChart" align="center"></div>
                        <button type="button" id = "ratio_submit" class="btn btn-default">Analysis</button>
                            <%--id : ${uid} --%>
                        <p></p>
                        <input type="hidden" id="snId" name="snId">
                        <input type="hidden" id="snSp" name="snSp">
                        <p></p>

                        <p></p>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <strong><span id="snp-selected" class="itemId_place"></span></strong><span id="sn-result"></span>
                            </div>
                        </div>

                        <div id="ratio_wait" class="wait">
                            <div id="loader5" class="loader"></div>
                        </div>
                        <div id="RTChart" align="center">
                        </div>
                        <p></p>
                        <div id="ratio-p-val" class="text-center"></div>
                        <div class="row">
                            <div class="col-md-8 col-md-offset-2">
                                <div id="ratio-options" class="hidden">
                                    <table class="table table-condensed">
                                        <colgroup>
                                            <col class='col-xs-2 col-md-2'>
                                            <col class='col-xs-6 col-md-6'>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group A</strong></small></td>
                                                <td id="ratio-options-td-a"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td><small><strong>Case Group B</strong></small></td>
                                                <td id="ratio-options-td-b"></td>
                                            </tr>
                                            <tr class="nohover">
                                                <td></td>
                                                <td><small><span class="text-right notbold-right"><sup><span class="glyphicon glyphicon-asterisk"></span></sup>Options selected by both groups appear in <strong><span class='text-primary'>boldface</span></strong>.</span></small></td>
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <p></p>
                    </div>

                    </div></div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="mainModal" role="dialog">
             <div class="modal-dialog modal-sm">
               <div class="modal-content">
                 <div class="modal-header">
                   <button type="button" class="close" data-dismiss="modal">&times;</button>
                   <h4 class="modal-title"></h4>
                 </div>
                 <div class="modal-body text-warning">
                   <p></p>
                 </div>
                 <div class="modal-footer">
                   <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                 </div>
               </div>
             </div>
        </div>       
                        
	<a id="back-to-top" href="#" class="btn btn-primary btn-lg back-to-top"
	  role="button" title="Back to Top" data-toggle="tooltip" data-placement="top">
	  <span class="glyphicon glyphicon-chevron-up"></span>
	</a>
<br><br>
    </body>
</html>
