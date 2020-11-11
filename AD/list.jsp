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

        <link href="css/bootstrap.min.css" rel="stylesheet">
	<style>
	    .jumbotron {
		background-color:transparent !important;
	    }
	    .small-msg {
		font-size:small !important;
	    }
	    .lead {
		font-size:12pt !important;
		text-indent: 15px;
	    }
	    .back-to-top {
		cursor: pointer;
		position: fixed;
		bottom: 0;
		right: 40px;
		display:none;
	    }

	    .table-borderless tbody tr td,
	    .table-borderless tbody tr th,
	    .table-borderless thead tr th,
	    .table-borderless thead tr td,
	    .table-borderless tfoot tr th,
	    .table-borderless tfoot tr td {
                border: none;
	    }
            
            .gene_cap {
                text-transform: uppercase !important;
            }            
	</style>

        <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
        <![endif]-->

        <script src="js/jquery.min.js"></script>
        <script src="js/bootstrap.min.js"></script>

	<script type="text/javascript">
	    $(document).ready(function() {

		$('[data-toggle="tooltip"]').tooltip();

                $("#sTerm").on('change keydown paste input', function(){
		    if ($.trim($("#sTerm").val()) !== "") {
			$('#helpErrBlock').addClass('hidden');
		    }
		});

		$('#searchForm').submit(function() {
		    if ($.trim($("#sTerm").val()) === "") {
			$('#helpErrBlock').removeClass('hidden');
			return false;
		    }
                });

		$('.gene_row').click(function () {
		    var lTxt = this.innerHTML;
		    $('#helpErrBlock').addClass('hidden');
		    $('#geneTxt').val(lTxt);
                    var cTxt = $(this).closest('tr').find('.chrom').text();
		    $('#chromTxt').val(cTxt);
		    $("#listForm").submit();
		});

		// scroll body to 0px on click
		$('#back-to-top').click(function () {
		    $('#back-to-top').tooltip('hide');
		    $('body,html').animate({
			scrollTop: 0
		    }, 400);
		    return false;
		});

		$(window).scroll(function () {
		    if ($(this).scrollTop() > 50) {
			$('#back-to-top').fadeIn();
		    } else {
			$('#back-to-top').fadeOut();
		    }
		});

            });

	</script>

      </head>
    <body>
	<div class="container">
	    <div class="jumbotron">
                <a href="/AD"><img src="img/logo_index.png" class="img-responsive center-block" alt="ADAS-Viewer" 
                                    style="width:45%; min-height: 47px; min-width: 180px"></a>
                <hr>
                <div class="form-group text-center">
                    <span style='margin-right:12em'><a href="/AD" target="_self">About</a></span>
                    <span style='margin-right:12em'><a href="/AD/search.html" target="_self">Search</a></span>  
                    <span style='margin-right:12em'><a href="/AD/manual/Data.pdf" target="_blank">Data</a></span>  
                    <span style='margin-right:12em'><a href="/AD/manual/manual.pdf" target="_blank">Tutorial</a></span>  
                    <span style='margin-right:0em'><a href="/AD/contact.html" target="_self">Contact</a></span>  
                </div>
                <hr>
		<p></p>
		<form action="/AD/list" id="searchForm" method="post" role="form">
		    <div class="form-group text-center">
			<span class="input-group">
			    <input type="text" class="form-control" placeholder="Search.." id="sTerm" name="sTerm" value=${sTerm}><span class="input-group-btn"><button type="submit" class="btn btn-primary"><span class="glyphicon glyphicon-search"></span></button></span>
			</span>
			<p></p>
			<span id="helpErrBlock" class="form-text text-danger small-msg hidden">
			    Please fill out the field.
			</span>
			<p></p>
		    </div>
		</form>

		<c:if test="${not empty Gene}">
                    <p></p>
		    Alternatively Spliced Gene found for <strong>Gene: </strong> ${sTerm}
                    <table class="table table-condensed table-borderless">
                        <colgroup>
                            <col class="col-xs-1">
                            <col class="col-xs-1">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        <c:forEach var="row" items="${Gene}">
                            <tr>
                                <td><a href="javascript:void(0);"><span class="gene_row lead gene_cap">${row.gene}</span></a></td>
                                <td>chr:<span class="chrom">${row.chrom}</span></td>
                                <td><small>[${row.trStart}-${row.trEnd}]</small></td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>
		    <c:if test="${fn:length(Gene) > 1}">
			<strong>${fn:length(Gene)}</strong> genes found</span>
		    </c:if>
		</c:if>

		<c:if test="${not empty EnsemblgeneID}">
                    <p></p>
		    Alternatively Spliced Gene found for <strong>SNP: </strong> ${sTerm}
                    <table class="table table-condensed table-borderless">
                        <colgroup>
                            <col class="col-xs-1">
                            <col class="col-xs-1">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        <c:forEach var="row" items="${EnsemblgeneID}">
                            <tr>
                                <td><a href="javascript:void(0);"><span class="gene_row lead gene_cap">${row.gene}</span></a></td>
                                <td>chr:<span class="chrom">${row.chrom}</span></td>
                                <td><small>[${row.trStart}-${row.trEnd}]</small></td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>
		    <c:if test="${fn:length(EnsemblgeneID) > 1}">
			<strong>${fn:length(EnsemblgeneID)}</strong> genes found</span>
		    </c:if>
		</c:if>

		<c:if test="${not empty SNP}">
                    <p></p>
		    Alternatively Spliced Gene found for <strong>SNP: </strong> ${sTerm}
                    <table class="table table-condensed table-borderless">
                        <colgroup>
                            <col class="col-xs-1">
                            <col class="col-xs-1">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        <c:forEach var="row" items="${SNP}">
                            <tr>
                                <td><a href="javascript:void(0);"><span class="gene_row lead gene_cap">${row.gene}</span></a></td>
                                <td>chr:<span class="chrom">${row.chrom}</span></td>
                                <td><small>[${row.trStart}-${row.trEnd}]</small></td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>
		    <c:if test="${fn:length(SNP) > 1}">
			<strong>${fn:length(SNP)}</strong> genes found</span>
		    </c:if>
		</c:if>

		<c:if test="${not empty Met}">
                    <p></p>
		    Alternatively Spliced Gene found for <strong>Methylation: </strong> ${sTerm}
                    <input type="hidden" id="metSterm" name="metSterm" value=${sTerm}>
                    <table class="table table-condensed table-borderless">
                        <colgroup>
                            <col class="col-xs-1">
                            <col class="col-xs-1">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        <c:forEach var="row" items="${Met}">
                            <tr>
                                <td><a href="javascript:void(0);"><span class="gene_row lead gene_cap">${row.gene}</span></a></td>
                                <td>chr:<span class="chrom">${row.chrom}</span></td>
                                <td><small>[${row.trStart}-${row.trEnd}]</small></td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>

		    <c:if test="${fn:length(Met) > 1}">
			<strong>${fn:length(Met)}</strong> genes found</span>
		    </c:if>
		</c:if>

		<c:if test="${not empty miRNA}">
                    <p></p>
		    Alternatively Spliced Genes found for <strong>miRNA: </strong> ${sTerm}
                    <input type="hidden" id="mirSterm" name="mirSterm" value=${sTerm}>
                    <table class="table table-condensed table-borderless">
                        <colgroup>
                            <col class="col-xs-1">
                            <col class="col-xs-1">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        <c:forEach var="row" items="${miRNA}">
                            <tr>
                                <td><a href="javascript:void(0);"><span class="gene_row lead gene_cap">${row.gene}</span></a></td>
                                <td>chr:<span class="chrom">${row.chrom}</span></td>
                                <td><small>[${row.trStart}-${row.trEnd}]</small></td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>

		    <c:if test="${fn:length(miRNA) > 1}">
			<strong>${fn:length(miRNA)}</strong> genes found</span>
		    </c:if>
		</c:if>

		<c:if test="${ifResult == 0}">
                    <p></p>
		    <strong>No Result</strong>
		</c:if>

		<form action="/AD/select" id="listForm" method="post" role="form">
		    <input type="hidden" name="geneTxt" id="geneTxt">
		    <input type="hidden" name="chromTxt" id="chromTxt">
                    
                    <input type="hidden" id="hTerm" name="hTerm" value=${sTerm}>
                    <c:if test="${not empty SNP}">
                        <input type="hidden" id="hType" name="hType" value="snp">
		    </c:if>
                    <c:if test="${not empty Met}">
                        <input type="hidden" id="hType" name="hType" value="met">
		    </c:if>
                    <c:if test="${not empty miRNA}">
                        <input type="hidden" id="hType" name="hType" value="mir">
		    </c:if>

		</form>
	    </div>
	</div>
        
        <style type ="text/css"> 
            .uhbanner {
                position:fixed;
                top: auto;
                bottom: 0px;
                right:0px;
                left:0px;
            }
        </style>            
                    
        <div class="uhbanner" style="background-color:#3278B3; color:white; padding:10px; text-align:center;">
            <div style="display: inline-block; text-align: left;">
            <a href="https://healthcare.utah.edu/" target="_blank"><img src="https://healthcare.utah.edu/rebrand/img/logos/uhealth-logo.svg" align="left" class="img-responsive center-block" alt="ADAS-Viewer" style="width:5%; min-height: 10px; min-width: 150px; margin-left:-10%"></a>
            <p style="margin-top:10px; width:120%">&nbsp; ©2017
            <a href="http://genomics.chpc.utah.edu" style="margin-top:10px; width:120%; color:white" target="_blank"> Genomics and Bioinformatics Lab.</a>
            <a href="http://medicine.utah.edu" style="margin-top:10px; width:120%; color:white" target="_blank">@ University of Utah School of Medicine, </a>
            <a href="http://medicine.utah.edu/dbmi" style="margin-top:10px; width:120%; color:white" target="_blank">Department of Biomedical Informatics.</a>
            <a id="back-to-top" href="#" class="btn btn-primary btn-lg back-to-top"
	  role="button" title="Back to Top" data-toggle="tooltip" data-placement="top">
            <span class="glyphicon glyphicon-chevron-up"></span>
            </a> 
            </p>
            </div>
        </div>             
        
        
    </body>
</html>
