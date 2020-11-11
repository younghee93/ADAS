/* global cdata */

$(document).ready(function() {
    // url for json ajax request and image
    var rsUrl = "http://genomics.chpc.utah.edu/";
    var trGrpMsg = 'Select at least one transcript with and w/o exon skipping';    
    
    $('[data-toggle="tooltip"]').tooltip();
    
    $(".wait").css("display", "none");

    $('#searchForm').submit(function() {
        if ($.trim($("#sTerm").val()) === "") {
            return false;
        }
    });
    
    $(".enst-each-move-a").click(function(){
        // find parent and get attr id
        var aNum = $(this).parent('.enst-each-a').attr('enst_attr');
        $(".enst-each-b").each(function() {
            var bNum = $(this).attr('enst_attr');
            // match enst_attr
            if (aNum === bNum) {
                $(this).addClass('active');
                $(this).removeClass('hidden');
            }
        });
        //set parent hidden
        $(this).parent('.enst-each-a').removeClass('active');        
        $(this).parent('.enst-each-a').addClass('hidden');        
    });

    $(".enst-each-move-b").click(function(){
        // find parent and get attr id
        var bNum = $(this).parent('.enst-each-b').attr('enst_attr');
        
        $(".enst-each-a").each(function() {
            var aNum = $(this).attr('enst_attr');
            // match enst_attr
            if (aNum === bNum) {
                $(this).addClass('active');
                $(this).removeClass('hidden');
            }
        });
        //set parent hidden
        $(this).parent('.enst-each-b').removeClass('active');        
        $(this).parent('.enst-each-b').addClass('hidden');        
    });


    /* to show tab menu for each cancer type */
    $(".cancer_vtab").click(function(){
        $(".cancer_vtab").each(function() {
            $("#" + this.id + "_content:visible").addClass('hidden');
        });
        $("#" + this.id + "_content").removeClass('hidden');
    });

    /* to select or de-select transcripts for group A and B */
    $(".enst-sel-a.btn-all").click(function(){
        $(".enst-each-a:visible").addClass('active');
    });
    $(".enst-sel-a.btn-none").click(function(){
        $(".enst-each-a.active:visible").removeClass('active');
    });
    $(".enst-sel-b.btn-all").click(function(){
        $(".enst-each-b:visible").addClass('active');
    });
    $(".enst-sel-b.btn-none").click(function(){
        $(".enst-each-b.active:visible").removeClass('active');
    });

    /* to select or de-select cancer options for group A and B */
    $(".btn-all.cancer-a").click(function(){
        var cActive = $(".cancer_vtab.active").attr('id');
        $("#" + cActive + "_content " + "." + cActive + "_option_a").addClass('active');
    });
    $(".btn-none.cancer-a").click(function(){
        var cActive = $(".cancer_vtab.active").attr('id');
        $("#" + cActive + "_content " + "." + cActive + "_option_a").removeClass('active');
    });
    $(".btn-all.cancer-b").click(function(){
        var cActive = $(".cancer_vtab.active").attr('id');
        $("#" + cActive + "_content " + "." + cActive + "_option_b").addClass('active');
    });
    $(".btn-none.cancer-b").click(function(){
        var cActive = $(".cancer_vtab.active").attr('id');
        $("#" + cActive + "_content " + "." + cActive + "_option_b").removeClass('active');
    });

    /* to select active transcripts for group A and B */
    $("#ic_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();

        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");
        var robj = { uid: uid, gene: gName, cancer: cName, g1: [], g2: [], options: [] };

        if (addTranGrp(robj, 'Transcript ratio') !== true) {
            return;
        }
        getOptions(cActive, robj.options);
        
        var robjS = "robjS=" + JSON.stringify(robj);
        
        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {
                
                if (!chkReturn(data.ret, data.rs, 'Transcript ratio')) {
                    return;
                }
                
                drawIC(data, "ICChart");
                $('#ICChart').removeClass('hidden');                
                
                $("#ic-p-val").html("<strong>Patient Group A:</strong> " + data.n1 
                        + ", <strong>Patient Group B:</strong> " + data.n2 
                        + ", <strong>Common:</strong> " + data.c1);
       
                $('body,html').animate({
                    scrollTop: $("#ICChart").offset().top
                }, 400);
                
                $("#ic-p-val").removeClass("hidden");
                $("#ic-options").removeClass("hidden");
                writeOptions(robj.options, "ic-options-td-a", "ic-options-td-b");
            },
            error: function(xhr, status, error) {
                jsonErrShow('Transcript ratio', xhr, status, error);
            },
            beforeSend: function() {
                $("#ic_submit").prop('disabled', true); // disable button
                $("#ic-p-val").addClass("hidden");
                $("#ic-p-val").text("");
                $("#ic-options").addClass("hidden");
                $('#ICChart').addClass('hidden');
                
                $("#ic_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#ic_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#ic_wait").css("display", "none");
                $("#ic_submit").prop('disabled', false); // enable button
            }
        });
    });

    /* to get the selected options for cancer */
    $("#cc_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();

        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");
        var robj = { uid: uid, gene: gName, cancer: cName, g1: [], g2: [], options: [] };

        if (addTranGrp(robj, 'Clinical correlation') !== true) {
            return;
        }
        getOptions(cActive, robj.options);

        var robjS = "robjS=" + JSON.stringify(robj);
        $.ajax({
            url: rsUrl + "rs/cc",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {
                
                if (!chkReturn(data.ret, data.rs, 'Clinical correlation')) {
                    return;
                }
                
                drawCC(data, "CCChart");
                $('#CCChart').removeClass('hidden');                
                
                drawCC2(data, "CCChart2");
                $('#CCChart2').removeClass('hidden');                
                
                $("#cc-p-val").html("<strong><i>p</i> value of High and Low (Patient Group A):</strong> " + data.pv0.toExponential(1) 
                        + "<br><strong><i>p</i> value of High and Low (Patient Group B):</strong> " + data.pv1.toExponential(1) 
                        + "<br><strong><i>p</i> value of High and Low (Patient Group A + B):</strong> " + data.pv2.toExponential(1));
                
                $("#cc-p-val2").html("<strong><i>p</i> value:</strong> " + data.pv3.toExponential(1));

                $('body,html').animate({
                    scrollTop: $("#CCChart").offset().top
                }, 400);
                
                $("#cc-p-val").removeClass("hidden");
                $("#cc-p-val2").removeClass("hidden");
                $("#cc-options").removeClass("hidden");
                writeOptions(robj.options, "cc-options-td-a", "cc-options-td-b");
            },
            error: function(xhr, status, error) {
                jsonErrShow('Clinical correlation', xhr, status, error);
            },
            beforeSend: function() {
                $("#cc_submit").prop('disabled', true); // disable button
                $("#cc-p-val").addClass("hidden");
                $("#cc-p-val").text("");
                $("#cc-p-val2").addClass("hidden");
                $("#cc-p-val2").text("");
                $("#cc-options").addClass("hidden");
                $('#CCChart').addClass('hidden');
                $('#CCChart2').addClass('hidden');
                
                $("#cc_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#cc_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#cc_wait").css("display", "none");
                $("#cc_submit").prop('disabled', false); // enable button
           }
        });
    });
    $("#ratio_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var snId = $("#snId").val();
        var snSp = $("#snSp").val();
        var pos = $("#SNPch").val();
        var hiID = $("#hiID").val();
        var tpp = $('#toggle-event').prop('checked');


        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");

        var robj = { uid: uid, gene: gName, cancer: cName, id: snId, g1: [], g2: [], options: [], tp: tpp, st: "snp", snSp: snSp, pos: pos};


        if (addTranGrp(robj, 'snp') !== true) {
            return;
        }

        getOptions(cActive, robj.options);
        var robjS = "robjS=" + JSON.stringify(robj);
        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {

                if (!chkReturn(data.ret, data.rs, 'snp')) {
                    return;
                }

                drawSNP(data, "RTChart", robj.uid);
                $('#RTChart').removeClass('hidden');

                $("#ratio-p-val").html("<strong>Patient Group A:</strong> " + data.n1
                        + ", <strong>Patient Group B:</strong> " + data.n2
                        + ", <strong>Common:</strong> " + data.c1);

                $('body,html').animate({
                    scrollTop: $("#RTChart").offset().top
                }, 400);

                $("#ratio-p-val").removeClass("hidden");
                $("#ratio-options").removeClass("hidden");
                writeOptions(robj.options, "ratio-options-td-a", "ratio-options-td-b");

            },
            error: function(xhr, status, error) {
                jsonErrShow('SNP', xhr, status, error);
            },
            beforeSend: function() {
                $("#ratio_submit").prop('disabled', true); // disable button
                $("#ratio-p-val").addClass("hidden");
                $("#ratio-p-val").text("");
                $("#ratio-options").addClass("hidden");
                $('#RTChart').addClass('hidden');

                $("#ratio_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#ratio_wait").offset().top
                }, 400);
            },
         complete: function(){
                $("#ratio_wait").css("display", "none");
                $("#ratio_submit").prop('disabled', false); // enable button
            }
        });
    });

    $("#exp_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var tpp = $('#toggle-event').prop('checked');


        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");
        var robj = { uid: uid, gene: gName, cancer: cName, g1: [], g2: [], options: [], tp: tpp, st: "exp"};

        if (addTranGrp(robj, 'Transcript ratio') !== true) {
            return;
        }

        getOptions(cActive, robj.options);
        var robjS = "robjS=" + JSON.stringify(robj);
        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {

                if (!chkReturn(data.ret, data.rs, 'Transcript ratio')) {
                    return;
                }

                drawEXP(data, "EXPChart", robj.uid);
                $('#EXPChart').removeClass('hidden');

                $("#exp-p-val").html("<strong>Patient Group A:</strong> " + data.n1
                        + ", <strong>Patient Group B:</strong> " + data.n2
                        + ", <strong>Common:</strong> " + data.c1);

                $('body,html').animate({
                    scrollTop: $("#EXPChart").offset().top
                }, 400);

                $("#exp-p-val").removeClass("hidden");
                $("#exp-options").removeClass("hidden");
                writeOptions(robj.options, "exp-options-td-a", "exp-options-td-b");

            },
            error: function(xhr, status, error) {
                jsonErrShow('Transcript ratio', xhr, status, error);
            },
            beforeSend: function() {
                $("#exp_submit").prop('disabled', true); // disable button
                $("#exp-p-val").addClass("hidden");
                $("#exp-p-val").text("");
                $("#exp-options").addClass("hidden");
                $('#EXPChart').addClass('hidden');

                $("#exp_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#exp_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#exp_wait").css("display", "none");
                $("#exp_submit").prop('disabled', false); // enable button
            }
        });
    });


    $("#me_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var meId = $("#meId").val();
        var tpp = $('#toggle-event').prop('checked');
        
        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");

        var robj = { uid: uid, gene: gName, cancer: cName, id: meId, g1: [], g2: [], options: [], tp: tpp, st: "met" };

        if (addTranGrp(robj, 'Methylation') !== true) {
            return;
        }
        if (meId === '' || meId === 'undefined' || meId === null) {
            $('#mainModal').find('.modal-title').text('Methylation');
            $('#mainModal').find('.modal-body').text('Select a Methylation');
            $('#mainModal').modal('show'); 
            return;
        }
        getOptions(cActive, robj.options);
        
        var robjS = "robjS=" + JSON.stringify(robj);
        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {
                
                if (!chkReturn(data.ret, data.rs, 'Methylation')) {
                    return;
                }                
                
                drawME(data, "MEChart", robj.uid);
                $('#MEChart').removeClass('hidden');                
                
                $("#me-p-val").html("<strong>Patient Group A:</strong> " + data.n1 
                        + ", <strong>Patient Group B:</strong> " + data.n2 
                        + ", <strong>Common:</strong> " + data.c1);
       
                $('body,html').animate({
                    scrollTop: $("#MEChart").offset().top
                }, 400);
                
                $("#me-p-val").removeClass("hidden");
                $("#me-options").removeClass("hidden");
                writeOptions(robj.options, "me-options-td-a", "me-options-td-b");
            },
            error: function(xhr, status, error) {
                jsonErrShow('Methylation', xhr, status, error);
            },
            beforeSend: function() {
                $("#me_submit").prop('disabled', true); // disable button
                $("#me-p-val").addClass("hidden");
                $("#me-p-val").text("");
                $("#me-options").addClass("hidden");
                $('#MEChart').addClass('hidden');
                
                $("#me_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#me_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#me_wait").css("display", "none");
                $("#me_submit").prop('disabled', false); // disable button
            }
        });
    });

    $("#rn_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var rnId = $("#rnId").val();
        var tpp = $('#toggle-event').prop('checked');
        
        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");

        var robj = { uid: uid, gene: gName, cancer: cName, id: rnId, g1: [], g2: [], options: [], tp: tpp, st: "mir"};

        if (addTranGrp(robj, 'miRNA') !== true) {
            return;
        }
        if (rnId === '' || rnId === 'undefined' || rnId === null) {
            $('#mainModal').find('.modal-title').text('miRNA');
            $('#mainModal').find('.modal-body').text('Select a miRNA');
            $('#mainModal').modal('show'); 
            return;
        }
        getOptions(cActive, robj.options);

        var robjS = "robjS=" + JSON.stringify(robj);
        
        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {
                
                if (!chkReturn(data.ret, data.rs, 'miRNA')) {
                    return;
                }                
                
                drawMI(data, "RNChart", robj.uid);
                $('#RNChart').removeClass('hidden');                
                
                $("#rn-p-val").html("<strong>Patient Group A:</strong> " + data.n1 
                        + ", <strong>Patient Group B:</strong> " + data.n2 
                        + ", <strong>Common:</strong> " + data.c1);
       
                $('body,html').animate({
                    scrollTop: $("#RNChart").offset().top
                }, 400);
                
                $("#rn-p-val").removeClass("hidden");
                $("#rn-options").removeClass("hidden");
                writeOptions(robj.options, "rn-options-td-a", "rn-options-td-b");
            },
            error: function(xhr, status, error) {
                jsonErrShow('miRNA', xhr, status, error);
            },
            beforeSend: function() {
                $("#rn_submit").prop('disabled', true); // disable button
                $("#rn-p-val").addClass("hidden");
                $("#rn-p-val").text("");
                $("#rn-options").addClass("hidden");
                $('#RNChart').addClass('hidden');
                
                $("#rn_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#rn_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#rn_wait").css("display", "none");
                $("#rn_submit").prop('disabled', false); // enable button
            }
        });
    });

    $("#sn_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var snId = $("#snId").val();
        var snSp = $("#snSp").val();
        var tpp = $('#toggle-event').prop('checked');


        var cActive = $(".cancer_vtab.active").attr('id');
        var cName = cActive.replace("cancer_", "");

        var robj = { uid: uid, gene: gName, cancer: cName, id: rnId, g1: [], g2: [], options: [], tp: tpp, st: "snp"};

        if (snId === '' || snId === 'undefined' || snId === null) {
            $('#mainModal').find('.modal-title').text('SNP');
            $('#mainModal').find('.modal-body').text('Select a SNP');
            $('#mainModal').modal('show');
            return;
        }

        getOptions(cActive, robj.options);

        var robjS = "robjS=" + JSON.stringify(robj);

        $.ajax({
            url: rsUrl + "rs/ic",
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {

                if (!chkReturn(data.ret, data.rs, 'SNP')) {
                    return;
                }

                drawSNP(data, "SNPChart", robj.uid);
                $('#SNPChart').removeClass('hidden');

                $("#snp-p-val").html("<strong>Patient Group A:</strong> " + data.n1
                        + ", <strong>Patient Group B:</strong> " + data.n2
                        + ", <strong>Common:</strong> " + data.c1);

                $('body,html').animate({
                    scrollTop: $("#SNPChart").offset().top
                }, 400);

                $("#snp-p-val").removeClass("hidden");
                $("#snp-options").removeClass("hidden");
                writeOptions(robj.options, "snp-options-td-a", "snp-options-td-b");
            },
            error: function(xhr, status, error) {
                jsonErrShow('snp', xhr, status, error);
            },
            beforeSend: function() {
                $("#sn_submit").prop('disabled', true); // disable button
                $("#snp-p-val").addClass("hidden");
                $("#snp-p-val").text("");
                $("#snp-options").addClass("hidden");
                $('#SNPChart').addClass('hidden');

                $("#snp_wait").css("display", "block");
                $('body,html').animate({
                    scrollTop: $("#sn_wait").offset().top
                }, 400);
            },
            complete: function(){
                $("#snp_wait").css("display", "none");
                $("#sn_submit").prop('disabled', false); // enable button
            }
        });
    });



    $("#pre.sn_submit").click(function(){
        var uid = $('#uid').val();
        var gName = $("#sTermH").val();
        var snId = $("#snId").val();
        var snSp = $("#snSp").val();
        var tpp = $('#toggle-event').prop('checked');
        
        //snId check, if selected
        if (snId === '' || snId === 'undefined' || snId === null) {
            $('#mainModal').find('.modal-title').text('SRE-SNP');
            $('#mainModal').find('.modal-body').text('Select a SNP');
            $('#mainModal').modal('show'); 
            return;
        }

        var robj = { uid: uid, gene: gName, id: snId, span: snSp, g1: [], g2: []};

        var robjS = "robjS=" + JSON.stringify(robj);
        $.ajax({
            url: '/cas/sn',
            type: 'post',
            dataType: 'json',
            data: robjS,
            success: function(data) {
                $('#sre-tbody').children('tr').remove();
                for (var i = 0; i < 6; i++) {
                    if (i < data.cnt) {
                        $('#sre-tbody').append('<tr id="sre_row' + i + '"></tr>');
                        var poshx = data.poshx[i];
                        var seq = "";
                        for (var j = poshx; j < 6; j++) {
                            seq += " ";
                        }
                        var fStr = data.hexamer[i].substring(0, poshx - 1);                     
                        var mStr = data.hexamer[i].substring(poshx - 1, poshx);                    
                        var rStr = data.hexamer[i].substring(poshx);                     

                        seq += fStr + "<strong class='text-primary'>" + mStr + "</strong>" + rStr;
                        $('#sre_row' + i).html(
                            "<td>" + data.types[i] + "</td>" + 
                            "<td>" + data.hxStart[i] + "</td>" + 
                            "<td>" + data.hxEnd[i] + "</td>" + 
                            "<td><span class='monosp'>" + seq + "</span></td>");
                    } else {
                        $('#sre-tbody').append('<tr class="nohover" id="sre_row' + i + '"></tr>');
                        $('#sre_row' + i).html(
                            "<td style='border-color: white;'><span class='monosp' style='color: white;'>" + "&nbsp;" + "</span></td>" + 
                            "<td style='border-color: white;'><span class='monosp' style='color: white;'>" + "&nbsp;" + "</span></td>" + 
                            "<td style='border-color: white;'><span class='monosp' style='color: white;'>" + "&nbsp;" + "</span></td>" + 
                            "<td style='border-color: white;'><span class='monosp' style='color: white;'>" + "&nbsp;" + "</span></td>"); 
                    }
                }
                if(!$("#sre_row6").is(':onScreen')) {
                    $('body,html').animate({
                        scrollTop: $("#sre-table").offset().top
                    }, 400);
                }
            },
            error: function(xhr, status, error) {
                jsonErrShow('SRE-SNP', xhr, status, error);
            },
            beforeSend: function() {
                $("#sn_submit").prop('disabled', true); // disable button
                // show table header
                $("#sre-table").removeClass("hidden");
            },
            complete: function(){
                $("#sn_submit").prop('disabled', false); // enable button
            }
        });
        
    });


    $("#slider1").slider({
    });

    $("#slider1").on("slide", function(slideEvt) {
        $("#slider1Val").text(slideEvt.value);
        drawMain(cdata, 1);
    });

    $("#slider1").on("change", function() {
        $("#slider1Val").text(this.value);
        drawMain(cdata, 1);
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

    $(".cancer-tab-toggle").click(function(){
        $(this).children("span").toggleClass("glyphicon-plus");
        $(this).children("span").toggleClass("glyphicon-minus");
    });

    $(".cancer-op-toggle").click(function(){
        $(this).children("span").toggleClass("glyphicon-plus");
        $(this).children("span").toggleClass("glyphicon-minus");
    });

    $(".cancer-op-toggle-all").click(function(){
        var tB = $(this).children("span");
        var cActive = $(".cancer_vtab.active").attr('id');
        if (tB.hasClass("glyphicon-plus")) {
            $("#" + cActive + "_content " + ".cancer-op-toggle").each(function() {
                if ($(this).children("span").hasClass("glyphicon-plus")) {
                    $(this).children("span").toggleClass("glyphicon-plus");
                    $(this).children("span").toggleClass("glyphicon-minus");
                }
            });
            $("#" + cActive + "_content " + ".collapse").each(function() {
                $(this).addClass("in");
            });
            $(this).tooltip('hide').attr('title', 'Collapse All').tooltip('fixTitle').tooltip('show');
        } else {
            $("#" + cActive + "_content " + ".cancer-op-toggle").each(function() {
                if (!$(this).children("span").hasClass("glyphicon-plus")) {
                    $(this).children("span").toggleClass("glyphicon-plus");
                    $(this).children("span").toggleClass("glyphicon-minus");
                }
            });
            $("#" + cActive + "_content " + ".collapse.in").each(function() {
                $(this).removeClass("in");
            });
            $(this).tooltip('hide').attr('title', 'Expand All').tooltip('fixTitle').tooltip('show');
        }
        tB.toggleClass("glyphicon-plus");
        tB.toggleClass("glyphicon-minus");
    });

    $.fn.multiline = function(text){
        this.text(text);
        this.html(this.html().replace(/\n/g,'<br/>'));
        return this;
    };
    
    
    function capFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }    
    
    function addTranGrp (robj, tName) {
        $(".enst-each-a.active").each(function() {
            if (!$(this).hasClass('hidden')) {
                robj.g1.push($(this).text());
            }
        });
        $(".enst-each-b.active").each(function() {
            if (!$(this).hasClass('hidden')) {
                robj.g2.push($(this).text());
            }
        });
        
        // check Transcripts are selected from each droup
        if (robj.g1.length === 0 && robj.g2.length === 0) {
            $('#mainModal').find('.modal-title').text(tName);
            $('#mainModal').find('.modal-body').text(trGrpMsg);
            $('#mainModal').modal('show'); 
            return false;
        }
        return true;
    }
    
    function chkReturn (rs, rsStr, task) {
        if (rs !== "okay") {
            $('#mainModal').find('.modal-title').text(task);
            $('#mainModal').find('.modal-body').text(rsStr);
            $('#mainModal').modal('show'); 
            return false;
        }
        return true;
    }    
    
    function jsonErrShow (task, xhr, status, error) {
        $('#mainModal').find('.modal-title').text(task);
        var msg = xhr.responseText + '\n' +
                status + "\n" + 
                error;
        $('#mainModal').find('.modal-body').text(msg);
        $('#mainModal').modal('show'); 
    }    
    
    function getOptions(cActive, ops) {
        $("#" + cActive + "_content " + ".cancer_fcap.cancer_op_h").each(function() {
            var ch = $(this).text();
            var dt = $(this).children("span").attr("data-target");

            var cOpH = [];

            $("#" + cActive + "_content " + dt + " .cancer_fcap.cancer_indent").each(function() {
                cOpH.push($(this).text());
            });

            var cOpA = [];
            $("#" + cActive + "_content " + dt + " ." + cActive + "_option_a").each(function() {
                if ($(this).hasClass('active')) {
                    cOpA.push("1");
                } else {
                    cOpA.push("0");
                }
            });
            var cOpB = [];
            $("#" + cActive + "_content " + dt + " ." + cActive + "_option_b").each(function() {
                if ($(this).hasClass('active')) {
                    cOpB.push("1");
                } else {
                    cOpB.push("0");
                }
            }); 
            var eachOption = [];
            for (var i = 0; i < cOpH.length; i++) {
                eachOption.push([cOpH[i] , cOpA[i], cOpB[i]]);
            }

            var eachOptionA = { option: ch, val: eachOption };
            ops.push(eachOptionA);
        });        
    }
 
    function writeOptions(ops, aId, bId) {
        
        var tdAstr = "<small>"; // output for group A
        var tdBstr = "<small>"; // output for group B

        for (var i = 0; i < ops.length; i++) {
            var tHead = ops[i].option; // gender
            var opEach = ops[i].val; //[key, v1, v2]

            tdAstr += "<span class='cancer_cap'>" + tHead + "</span>" + ":";
            tdBstr += "<span class='cancer_cap'>" + tHead + "</span>" + ":";

            for (var j = 0; j < opEach.length; j++) {
                if (opEach[j][1] === "1" && opEach[j][2] === "1") {
                    tdAstr += " <strong><span class='text-primary'>" + capFirst(opEach[j][0]) + "</span></strong>";
                    tdBstr += " <strong><span class='text-primary'>" + capFirst(opEach[j][0]) + "</span></strong>";
                } else if (opEach[j][1] === "1" && opEach[j][2] !== "1") {
                    tdAstr += " <span class='text-primary'>" + capFirst(opEach[j][0]) + "</span>";
                    tdBstr += " <span class='text-muted-more'>" + capFirst(opEach[j][0]) + "</span>";
                } else if (opEach[j][1] !== "1" && opEach[j][2] === "1") {
                    tdAstr += " <span class='text-muted-more'>" + capFirst(opEach[j][0]) + "</span>";
                    tdBstr += " <span class='text-primary'>" + capFirst(opEach[j][0]) + "</span>";
                } else {
                    tdAstr += " <span class='text-muted-more'>" + capFirst(opEach[j][0]) + "</span>";
                    tdBstr += " <span class='text-muted-more'>" + capFirst(opEach[j][0]) + "</span>";
                }

                if (j + 1 < opEach.length) {
                    tdAstr += ",";
                    tdBstr += ",";
                }
            }
            if (i + 1 < ops.length) {
                tdAstr += "<br>";
                tdBstr += "<br>";
            }
        }

        $("#" + aId).html(tdAstr + "</small>");
        $("#" + bId).html(tdBstr + "</small>");
                
    }
    
    (function(a){
        a.expr[":"].onScreen=function(b){
            var c=a(window),d=c.scrollTop(),e=c.height(),f=d+e,g=a(b),h=g.offset().top,i=g.height(),j=h+i;
            return h>=d&&h<f||j>d&&j<=f||i>e&&h<=d&&j>=f;
        };
    })(jQuery);
});
