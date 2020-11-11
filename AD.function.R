lmp <- function (modelobject) {
  if (class(modelobject) != "lm") stop("Not an object of class 'lm' ")
  f <- summary(modelobject)$fstatistic
  p <- pf(f[1],f[2],f[3],lower.tail=F)
  attributes(p) <- NULL
  return(p)
}

par.json <- function(test.mat,data.dir){
    if (is.element("id",names(test.mat))){
      each.id <- unlist(test.mat["id"])
      }
    else  each.id <- NULL
    each.uid <- unlist(test.mat["uid"])
    each.gene <- unlist(test.mat["gene"])
    each.cancer <- unlist(test.mat["cancer"])
    each.g1 <- gsub(" ","",unlist(test.mat["g1"]))
    each.g2 <- gsub(" ","",unlist(test.mat["g2"]))
    each.options <- test.mat$"options"
    clinical.data <- unique(as.matrix(read.table(paste(data.dir,"/ADAS/AD.clinical/",each.cancer,"_cli.txt",sep=""),sep='\t',header=T)))
    option.nums <- 1:length(each.options)
    final.options <- NULL
    final.options <- lapply(1:length(option.nums),function(i){
      each.names <- each.options[option.nums[i]][[1]]$option
      each.mat <- matrix(unlist(each.options[option.nums[i]][[1]]$val),ncol=3,byrow=T)
      g1.option <- each.mat[each.mat[,2] == "1",1]
      g2.option <- each.mat[each.mat[,3] == "1",1]
      g1.samples <- unique(clinical.data[is.element(clinical.data[,each.names],g1.option),"SampleID"])
      g2.samples <- unique(clinical.data[is.element(clinical.data[,each.names],g2.option),"SampleID"])
      final.li <- list(g1.samples,g2.samples)
      names(final.li) <- c(paste(each.names,":",paste(g1.option,collapse=","),sep=""),paste(each.names,":",paste(g2.option,collapse=","),sep=""))
      final.li
    })
    sample.g1 <- clinical.data[,"SampleID"]
    sample.g2 <- clinical.data[,"SampleID"]
    total.names <- NULL
    for (i in 1:length(option.nums)){
      each.names <- each.options[option.nums[i]][[1]]$option
      total.names <- c(total.names,each.names)
    }
    names(final.options) <- total.names
    g1.options <- NULL
    g2.options <- NULL
    for (i in 1:length(final.options)){
      g1.options <- paste(g1.options,names(final.options[[i]])[1],"\n",sep="")
      g2.options <- paste(g2.options,names(final.options[[i]])[2],"\n",sep="")
      sample.g1 <- intersect(sample.g1,final.options[[i]][[1]])
      sample.g2 <- intersect(sample.g2,final.options[[i]][[2]])
    }
    g1.options <- paste(g1.options,"g1",sep="")
    g2.options <- paste(g2.options,"g2",sep="")
    return.list <- list(each.id,each.uid,each.gene,each.cancer,each.g1,each.g2,sample.g1,sample.g2)
    if (length(each.id) != 0){
      return.list <- list(each.id,each.uid,each.gene,each.cancer,each.g1,each.g2,sample.g1,sample.g2)
      names(return.list) <- c("id","uid","gene","tumor","g1tx","g2tx",g1.options,g2.options)
    }
    else{
      return.list <- list(each.uid,each.gene,each.cancer,each.g1,each.g2,sample.g1,sample.g2)
      names(return.list) <- c("uid","gene","tumor","g1tx","g2tx",g1.options,g2.options)
    }
    return(return.list)
}

cli.info <- function(te.exp,cn.num){
    f.mat <- paste("SampleID",": ",te.exp[,cn.num[1]],sep="")
        for(i in 2:length(cn.num)){
            f.mat <- paste(f.mat,paste(cn.num[i],": ",te.exp[,cn.num[i]],sep=""),sep="<BR>")
        }
    return (f.mat)
}

EXP.f <- function(oper.list){
    g1.txs <- oper.list$g1
    g2.txs <- oper.list$g2
    g1.samples <- oper.list$g1.s
    g2.samples <- oper.list$g2.s
    region.type <- oper.list$reg
    data.dir <- oper.list$data.dir
    clinical.data <- oper.list$cli
    samcolid <- oper.list$id
    uid <- oper.list$uid
    total.txs <- unique(c(g1.txs,g2.txs))
    RT <- oper.list$"tp"
    tx.exp <- NULL
    exp.dir <- paste(data.dir,"/ADAS/AD.expression/",region.type,"/",sep="")
    total.txs <- paste(total.txs,".exp",sep="")
    total.tx.exp <- NULL
    for (i in 1:length(total.txs)){
        ea.exp <- try(read.table(paste(exp.dir,total.txs[i],sep=""),sep="\t",header=T),silent=T)
        if (!length(grep("Error",ea.exp[1]))){
            colnames(ea.exp) <- gsub("X","",colnames(ea.exp))
            total.tx.exp <- rbind(total.tx.exp,as.matrix(ea.exp))
        }
    }
    if (!length(total.tx.exp))    return ("Warning : There is no value for expression")
    f.total.exp <- NULL
    for (i in 1:length(total.tx.exp[,1])){
        f.total.exp <- rbind(f.total.exp,cbind(colnames(total.tx.exp),total.tx.exp[i,],total.tx.exp[i,"TID"]))
    }
    total.g1.exp <- cbind(f.total.exp[is.element(f.total.exp[,1],g1.samples),],"Group A")
    total.g2.exp <- cbind(f.total.exp[is.element(f.total.exp[,1],g2.samples),],"Group B")
    t.plot.mat <- rbind(total.g1.exp,total.g2.exp)
    if (!length(t.plot.mat))    return ("Warning : There is no value for expression")
    tp <- "Expression: PSI"
    poi <- "all"
    if (!RT){
        tp <- "Expression: TPM"
        poi <- "outlier"
    }
    s1.num <- unique(rownames(t.plot.mat)[t.plot.mat[,4] == "Group A"])
    s2.num <- unique(rownames(t.plot.mat)[t.plot.mat[,4] == "Group B"])
    s1.s2.num <- length(intersect(s1.num,s2.num))
    s.num <- paste("N:",length(s1.num),"-",length(s2.num),"-",s1.s2.num,sep="")
    g1.stat <- paste("G1:",paste(boxplot(as.double(total.g1.exp[,2]),plot=F)$stats,collapse="-"),sep="")
    g2.stat <- paste("G2:",paste(boxplot(as.double(total.g1.exp[,2]),plot=F)$stats,collapse="-"),sep="")
    t.pvalue <- 0.01
    return.string <- paste(g1.stat,g2.stat,t.pvalue,s.num,sep=",")
    colnames(t.plot.mat) <- c("ID","Expression","EnsembleID","Groups")
    t.plot.df <- data.frame(t.plot.mat[,1],as.double(t.plot.mat[,2]),t.plot.mat[,3],t.plot.mat[,4])
    colnames(t.plot.df) <- colnames(t.plot.mat)
    cli.mat <- unique(merge(t.plot.mat,clinical.data,by.x="ID",by.y=samcolid))
    
    if (region.type == "DLPFC")    .cn <- c("Diagnosis","Sex","ApoE","BraakScore","Race","Dementia","Education")
    if (region.type == "CER" | region.type == "TCX")    .cn <- c("Diagnosis","Sex","ApoE")
    if (region.type == "STG" | region.type == "FP" | region.type == "PHG" | region.type == "IFG")    .cn <- c("Diagnosis","Sex","ApoE","BraakScore","Race","Dementia","PlaqueMean")

    text.nm <- cli.info(cli.mat,c("ID",.cn))
    text.nm <- gsub("\n","<br>",text.nm)
    jsonplot.mat <- data.frame(as.character(cli.mat[,"ID"]),as.double(as.matrix(cli.mat[,"Expression"])),cli.mat[,"EnsembleID"],cli.mat[,"Groups"],as.character(text.nm))
    colnames(jsonplot.mat) <- c("ID","Expression","EnsembleID","Groups","sampleInfo")

    t.pv <- anno.make(t.plot.mat,TRUE,t.te=TRUE)
    t.pv.df <- data.frame(t.pv[,1],t.pv[,2],as.double(t.pv[,3]))
    colnames(t.pv.df) <- c("x","te","y")
    jsonoper <- plot_ly() %>% 
        add_trace(data=jsonplot.mat,x=~EnsembleID,y=~Expression,color=~Groups,text=~sampleInfo, type="box",legendgroup=~EnsembleID,boxpoints="outlier",hoverinfo="text") %>%
        add_trace(data=t.pv.df,x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=F) %>%
        layout(boxmode = "group",yaxis=list(title=tp),xaxis=list(title="EnsembleID")) %>% rangeslider()
    json.file <- plotly_json(jsonoper,FALSE)
    write(json.file,paste("/var/lib/tomcat/genomics/rs/img/",uid,"_EXP.txt",sep=""))
    return (return.string)
}

RT.f <- function(oper.list){
    library(RJSONIO)
    g1.txs <- paste(oper.list$g1,".exp",sep="")
    g2.txs <- paste(oper.list$g2,".exp",sep="")
    g1.samples <- oper.list$g1.s
    g2.samples <- oper.list$g2.s
    region.type <- oper.list$reg
    data.dir <- oper.list$data.dir
    clinical.data <- oper.list$cli
    samcolid <- oper.list$id
    uid <- oper.list$uid
    total.txs <- unique(c(g1.txs,g2.txs))
    g1.tx.exp <- NULL
    g2.tx.exp <- NULL
    exp.dir <- paste(data.dir,"/ADAS/AD.expression/",region.type,"/",sep="")
    RT <- oper.list$"tp"
    for (i in 1:length(g1.txs)){
        ea.exp <- try(read.table(paste(exp.dir,g1.txs[i],sep=""),sep="\t",header=T),silent=T)
        if (!length(grep("Error",ea.exp[1]))){
            colnames(ea.exp) <- gsub("X","",colnames(ea.exp))
            g1.tx.exp <- rbind(g1.tx.exp,as.matrix(ea.exp))
        }
    }
    for (i in 1:length(g2.txs)){
        ea.exp <- try(read.table(paste(exp.dir,g2.txs[i],sep=""),sep="\t",header=T),silent=T)
        if (!length(grep("Error",ea.exp[1]))){
        colnames(ea.exp) <- gsub("X","",colnames(ea.exp))
        g2.tx.exp <- rbind(g2.tx.exp,as.matrix(ea.exp))
        }
    }
    if (!length(g1.tx.exp) | !length(g2.tx.exp))    return ("Warning : There is no value for ratio")
    g1.tx.exp <- rbind(g1.tx.exp[,colnames(g1.tx.exp) != "TID"])
    g2.tx.exp <- rbind(g2.tx.exp[,colnames(g2.tx.exp) != "TID"])
    sum.g1 <- apply(g1.tx.exp,2,function(x)    sum(as.double(x)))
    sum.g2 <- apply(g2.tx.exp,2,function(x)    sum(as.double(x)))
    psi.ratio <- sum.g1/(sum.g1+sum.g2)
    psi.ratio <- psi.ratio[psi.ratio != "NaN" & !is.na(psi.ratio) & psi.ratio != "Inf"]
    if (length(psi.ratio) == 0)  return ("Warning : There is no value for ratio")
    psi.ratio.1 <- psi.ratio[is.element(names(psi.ratio),g1.samples)]
    psi.ratio.2 <- psi.ratio[is.element(names(psi.ratio),g2.samples)]
    if (length(psi.ratio.1) == 0 | length(psi.ratio.2) == 0)  return ("Warning : There is no value for ratio")
        tp <- "Expression: PSI"
    poi <- "all"
    if (!RT){
        tp <- "Expression: TPM"
        poi <- "outlier"
    }
    psi.ratio.1 <- cbind(psi.ratio.1,"Group A")
    psi.ratio.2 <- cbind(psi.ratio.2,"Group B")
    psi.ratio <- rbind(psi.ratio.1,psi.ratio.2)
    s1.num <- rownames(psi.ratio)[psi.ratio[,2] == "Group A"]
    s2.num <- rownames(psi.ratio)[psi.ratio[,2] == "Group B"]
    s1.s2.num <- length(intersect(s1.num,s2.num))
    s.num <- paste("N:",length(s1.num),"-",length(s2.num),"-",s1.s2.num,sep="")
    g1.stat <- paste("G1:",paste(boxplot(as.double(psi.ratio.1[,1]),plot=F)$stats,collapse="-"),sep="")
    g2.stat <- paste("G2:",paste(boxplot(as.double(psi.ratio.2[,1]),plot=F)$stats,collapse="-"),sep="")
    psi.ratio <- data.frame(as.double(psi.ratio[,1]),psi.ratio[,2])
    psi.ratio <- psi.ratio[psi.ratio[,1] != "NA",]
    if (length(s1.num) == 0 | length(s2.num) == 0)  return ("Warning : There is ratio for two groups")
    t.pvalue <- try(paste("Pv:",round(t.test(psi.ratio[psi.ratio[,2] == "Group A",1],psi.ratio[psi.ratio[,2] == "Group B",1])$p.value,digit=4),sep=""),silent=T)
    if (length(grep("Error",t.pvalue[1])))  t.pvalue <- "NA"
    colnames(psi.ratio) <- c("Ratio","Groups")
    return.string <- paste(g1.stat,g2.stat,t.pvalue,s.num,sep=",")
    cli.mat <- rbind(psi.ratio.1,psi.ratio.2)
    cli.mat <- cbind(names=gsub("[.]","-",rownames(cli.mat)),cli.mat)
    clinical.data[,"SampleID"] <- gsub(" ","",clinical.data[,"SampleID"])
    cli.mat <- unique(as.matrix(merge(cli.mat,clinical.data,by.x="names",by.y=samcolid)))
    if (region.type == "DLPFC")    .cn <- c("Diagnosis","Sex","ApoE","BraakScore","Race","Dementia","Education")
    if (region.type == "CER" | region.type == "TCX")    .cn <- c("Diagnosis","Sex","ApoE")
    if (region.type == "STG" | region.type == "FP" | region.type == "PHG" | region.type == "IFG")    .cn <- c("Diagnosis","Sex","ApoE","BraakScore","Race","Dementia","PlaqueMean")
    text.nm <- cli.info(cli.mat,c("names",.cn))
    text.nm <- gsub("\n","<br>",text.nm)
    jsonplot.mat <- data.frame(as.character(cli.mat[,"names"]),as.double(as.matrix(cli.mat[,"psi.ratio.1"])),"Groups",cli.mat[,"V3"],as.character(text.nm))
    colnames(jsonplot.mat) <- c("ID","Expression","EnsembleID","Groups","sampleInfo")
    t.pv <- anno.make(jsonplot.mat,TRUE,t.te=TRUE)
    t.pv.df <- data.frame(t.pv[,1],t.pv[,2],as.double(t.pv[,3]))
    colnames(t.pv.df) <- c("x","te","y")
    jsonoper <- plot_ly(jsonplot.mat,x=~EnsembleID,text=~sampleInfo,y=~Expression,color=~Groups, type="box", jitter = 0.2, marker = list(size = 4),pointpos = 0,boxpoints="all") %>%
        add_trace(data=t.pv.df,x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=F) %>%
        layout(boxmode = "group",yaxis=list(title=tp),xaxis=list(title=""))
    json.file <- plotly_json(jsonoper,FALSE)
    write(json.file,paste("/var/lib/tomcat/genomics/rs/img/",uid,"_EXP.txt",sep=""))
    if (length(cli.mat) == 0)    return ("Warning : There is no txt")
    if (length(return.string) == 0)    return ("Warning : There is no return")
    return (return.string)
}

exp.make.f <- function(oper.list){
    g1.txs <- oper.list$g1
    g2.txs <- oper.list$g2
    g1.samples <- oper.list$g1.s
    g2.samples <- oper.list$g2.s
    region.type <- oper.list$reg
    geneNM <- oper.list$gene
    data.dir <- oper.list$data.dir
    clinical.data <- oper.list$cli
    samcolid <- oper.list$id
    uid <- oper.list$uid
    total.txs <- unique(c(g1.txs,g2.txs))
    tx.exp <- NULL
    RT <- oper.list$"tp"
    tp <- "ratio"
    if (!RT)    tp <- "expression"
    exp.dir <- paste(data.dir,"/ADAS/AD.expression/",region.type,"/",sep="")
    total.txs <- paste(total.txs,".exp",sep="")
    total.tx.exp <- NULL
    for (i in 1:length(total.txs)){
        ea.exp <- try(read.table(paste(exp.dir,total.txs[i],sep=""),sep="\t",header=T),silent=T)
        if (!length(grep("Error",ea.exp[1]))){
            colnames(ea.exp) <- gsub("X","",colnames(ea.exp))
            total.tx.exp <- rbind(total.tx.exp,as.matrix(ea.exp))
        }
    }
    if (!length(total.tx.exp))    return (paste("Warning : There is no value for ",tp,sep=""))
    if (!RT){
        f.total.exp <- NULL
        for (i in 1:length(total.tx.exp[,1])){
            f.total.exp <- rbind(f.total.exp,cbind(colnames(total.tx.exp),total.tx.exp[i,],total.tx.exp[i,"TID"]))
        }
        total.g1.exp <- cbind(f.total.exp[is.element(f.total.exp[,1],g1.samples),],"Group A")
        total.g2.exp <- cbind(f.total.exp[is.element(f.total.exp[,1],g2.samples),],"Group B")
        t.plot.mat <- rbind(total.g1.exp,total.g2.exp)
    }    
    if (RT){
        g1.tx.exp <- rbind(total.tx.exp[is.element(total.tx.exp[,1],g1.txs),])
        g2.tx.exp <- rbind(total.tx.exp[is.element(total.tx.exp[,1],g2.txs),])
        if (!length(g1.tx.exp) | !length(g2.tx.exp))    return (paste("Warning : There is no value for ",tp,sep=""))
        g1.tx.exp <- rbind(g1.tx.exp[,colnames(g1.tx.exp) != "TID"])
        g2.tx.exp <- rbind(g2.tx.exp[,colnames(g2.tx.exp) != "TID"])
        sum.g1 <- apply(g1.tx.exp,2,function(x)    sum(as.double(x)))
        sum.g2 <- apply(g2.tx.exp,2,function(x)    sum(as.double(x)))
        psi.ratio <- sum.g1/(sum.g1+sum.g2)
        psi.ratio <- psi.ratio[psi.ratio != "NaN" & !is.na(psi.ratio) & psi.ratio != "Inf"]
        if (length(psi.ratio) == 0)  return (paste("Warning : There is no value for ",tp,sep=""))
        psi.ratio.1 <- psi.ratio[is.element(names(psi.ratio),g1.samples)]
        psi.ratio.2 <- psi.ratio[is.element(names(psi.ratio),g2.samples)]
        if (length(psi.ratio.1) == 0 | length(psi.ratio.2) == 0)  return (paste("Warning : There is no value for",tp,sep=""))
        psi.ratio.1 <- cbind(psi.ratio.1,"Group A")
        psi.ratio.2 <- cbind(psi.ratio.2,"Group B")
        psi.ratio <- rbind(psi.ratio.1,psi.ratio.2)
        t.plot.mat <- cbind(rownames(psi.ratio),psi.ratio[,1],"Groups",psi.ratio[,2])
    }
    s1.num <- unique(rownames(t.plot.mat)[t.plot.mat[,4] == "Group A"])
    s2.num <- unique(rownames(t.plot.mat)[t.plot.mat[,4] == "Group B"])
    s1.s2.num <- length(intersect(s1.num,s2.num))
    s.num <- paste("N:",length(s1.num),"-",length(s2.num),"-",s1.s2.num,sep="")
    g1.stat <- paste("G1:",paste(boxplot(as.double(t.plot.mat[,2]),plot=F)$stats,collapse="-"),sep="")
    g2.stat <- paste("G2:",paste(boxplot(as.double(t.plot.mat[,2]),plot=F)$stats,collapse="-"),sep="")
    t.pvalue <- 0.01
    return.string <- paste(g1.stat,g2.stat,t.pvalue,s.num,sep=",")
    colnames(t.plot.mat) <- c("ID","Expression","EnsembleID","Groups")
    cli.mat <- as.matrix(unique(merge(t.plot.mat,clinical.data,by.x="ID",by.y=samcolid)))
    idkey <- read.table(paste(data.dir,"ADAS/AD.clinical/",region.type,"_IDkey",sep=""),sep='\t',header=T)
    f.mer.mat <- unique(as.matrix(merge(idkey,cli.mat,by.x="RNAseqid",by.y="ID")))
    return (list(f.mer.mat,return.string))
}


anno.make <- function(te.mat,mat=FALSE,x.n=2,id.nm="EnsembleID",t.te=FALSE,g=FALSE,gn=c(2,2),exp.nm="Expression"){
    if (g){
        ev <- c(rep(TRUE,gn[1]),TRUE,rep(FALSE,gn[2]),FALSE)
        g1.on <- list(label="Group A",method = "update",args = list(list(visible=ev)))
        g2.on <- list(label="Group B",method = "update",args = list(list(visible=!ev)))
        g.anno <- list(list(active=0,type='dropdown',showactive=FALSE,direction="down",x=0.83,y=1.2,buttons = list(g1.on,g2.on)))
        return (g.anno)
    }
    t.pv <- do.call(rbind,lapply(unique(as.matrix(te.mat[,id.nm])),function(x){
        rv <- NULL
        ea.mat <- rbind(te.mat[te.mat[,id.nm] == as.character(x),])
        if (t.te){
            t.re <- try(t.test(as.double(ea.mat[ea.mat[,"Groups"] == "Group A",exp.nm]),as.double(ea.mat[ea.mat[,"Groups"] == "Group B",exp.nm]))$p.value)
        }
        else if (!t.te){
            lmv <- try(lm(as.double(ea.mat[,exp.nm]) ~ as.double(ea.mat[,x.n])),silent=T)
            rv <- try(summary(lmv)$adj.r.squared,silent=T)
            t.re <- try(lmp(lmv),silent=T)
        }
        er.te <- length(grep("Error",t.re))
        mv.nm <- max(as.double(ea.mat[,exp.nm]))
        if (er.te)    pv <- c(EnsembleID=x,p="Not testable",mv=mv.nm*1.1)
        else if (!er.te){
            if (length(rv)){
                pv <- c(EnsembleID=x,p=paste("p=",format(t.re,scientific=T),"<BR>r2=",format(rv,scientific=T),sep=""),mv=mv.nm*1.1)
            }
            else if (!length(rv)){
                pv <- c(EnsembleID=x,p=paste("p=",format(t.re,scientific=T),sep=""),mv=mv.nm*1.1)
            }
        }
    }))
    if (mat)    return (t.pv)
    anno = list()
    for (i in 1:length(t.pv[,id.nm])){
        pre.anno <- list(x = t.pv[i,id.nm],y=as.double(t.pv[i,"mv"]),text=paste("<i>",t.pv[i,"p"],sep=""),
            opacity=0.8,xref='x', yref='y',ax = 0,ay = -25,font=list(size=12,color="red"),showarrow=TRUE)
        anno[[as.integer(i+0)]] <- pre.anno
    }
    p.on <- list(label="Pvalue: On",method = "update",args = list(list(),list(annotations=anno)))
    p.off <- list(label="Pvalue: Off",method = "update",args = list(list(),list(annotations=c())))
    upt <- list(list(active=1,type='dropdown',showactive=FALSE,direction="down",x=0.83,y=1.1,buttons = list(p.on,p.off)))
    return (upt)
}



snp.f <- function(oper.list,posi,ch){
#    json.mat$snSp -> posi
#    json.mat$pos -> ch
    g1.txs <- oper.list$g1
    g2.txs <- oper.list$g2
    g1.samples <- oper.list$g1.s
    g2.samples <- oper.list$g2.s
    region.type <- oper.list$reg
    geneNM <- oper.list$gene
    data.dir <- oper.list$data.dir
    clinical.data <- oper.list$cli
    snp.id <- oper.list$molid
    samcolid <- oper.list$id
    uid <- oper.list$uid
    .cn <- oper.list$cn
    total.txs <- unique(c(g1.txs,g2.txs))
    tx.exp <- NULL
    RT <- oper.list$"tp"
    tp <- "Expression: PSI"
    poi <- "all"
    st.alleles <- c("A","T","G","C")
    if (!is.element(ch,c(1:22,"X","Y","MT"))){
        return (paste("Warning : There is no polymorphism at ",snp.id," (chr",ch,":",posi,")",sep=""))
    }
    library(VariantAnnotation)
    if (!RT){
        #if (length(unique(c(g1.txs,g2.txs))) > 5)    return ("Warning : Select less than 5 transcripts for the analysis")
        tp <- "Expression: TPM"
        poi <- "outlier"
    }
    vcf.nm <- c("NIA_JG_1898_samples_GRM_WGS_b37_JointAnalysis01_2017-12-08_",".recalibrated_variants.vcf.gz")
    exp.mat.re <- exp.make.f(oper.list)
    if (length(grep("Warning",exp.mat.re)))    return (exp.mat.re)
    exp.mat <- exp.mat.re[[1]]
    return.string <- exp.mat.re[[2]]
    vcf.file <- paste(data.dir,"/ADAS/AD.WGS/",vcf.nm[1],ch,vcf.nm[2],sep="")
    posi.va <- GRanges(Rle(as.character(ch)),ranges=IRanges(as.integer(posi),as.integer(posi)))
    geno.data <- readGT(TabixFile(vcf.file,index=paste(vcf.file,".tbi",sep="")),param=posi.va)
    if (!length(geno.data))    return (paste("Warning : There is no polymorphism at ",snp.id," (chr",ch,":",posi,")",sep=""))
    rn <- do.call(rbind,strsplit(do.call(rbind,strsplit(rownames(geno.data),"_"))[,2],"/"))
    geno.ev <- is.element(rn[,1],st.alleles) & is.element(rn[,2],st.alleles)
    if (!geno.ev)    return (paste("Warning : There is no polymorphism at ",snp.id," (chr",ch,":",posi,")",sep=""))
    alleles <- strsplit(strsplit(rownames(geno.data),"_")[[1]][2],"/")[[1]]
    alleles <- c(paste(alleles[1],alleles[1],sep=""),paste(alleles[1],alleles[2],sep=""),paste(alleles[2],alleles[2],sep=""))
    geno.data.mat <- cbind(ID=colnames(geno.data),geno=matrix(geno.data,ncol=1))
    geno.data.mat[,2] <- apply(do.call(rbind,strsplit(geno.data.mat[,2],"/")),1,function(x)    length(which(x != 0)))
    colnames(geno.data.mat) <- c("ID","geno")
    if (!length(geno.data))    return (paste("Warning : There is no polymorphism at ",snp.id," (chr",ch,":",posi,")",sep=""))
    f.mer.mat <- unique(as.matrix(merge(geno.data.mat,exp.mat,by.x="ID",by.y="WGSid")))
    t.geno <- table(f.mer.mat[,"geno"])
    if (length(t.geno) == 1)    return (paste("Warning : There is no polymorphism at ",snp.id," (chr",ch,":",posi,")",sep=""))
    if (length(unique(f.mer.mat[,"Groups"])) < 2){
        ab <- paste(c("Group A","Group B")[!is.element(c("Group A","Group B"),f.mer.mat[,7])],collapse=", ")
        return (paste("Warning : There is no testable samples of ",ab,sep=""))
    }
    g1.mat <- rbind(f.mer.mat[f.mer.mat[,"Groups"] == "Group A",])
    g2.mat <- rbind(f.mer.mat[f.mer.mat[,"Groups"] == "Group B",])
    g1.p <- anno.make(g1.mat,TRUE)
    g2.p <- anno.make(g2.mat,TRUE)
    g1.p.df <- data.frame(g1.p[,1],g1.p[,2],as.double(g1.p[,3]))
    g2.p.df <- data.frame(g2.p[,1],g2.p[,2],as.double(g2.p[,3]))
    colnames(g2.p.df) <- colnames(g1.p.df) <- c("x","te","y")
    g.an <- anno.make(g=TRUE,gn=c(length(unique(g1.mat[,"geno"])),length(unique(g2.mat[,"geno"]))))
    g1.mat[,"geno"] <- alleles[as.integer(as.integer(g1.mat[,"geno"])+1)]
    g2.mat[,"geno"] <- alleles[as.integer(as.integer(g2.mat[,"geno"])+1)]
    g1.te <- cli.info(g1.mat,c("ID",.cn))
    g2.te <- cli.info(g2.mat,c("ID",.cn))
    g1.df <- data.frame(g1.mat[,"EnsembleID"],g1.mat[,"Groups"],factor(g1.mat[,"geno"],levels=alleles),as.double(g1.mat[,"Expression"]),g1.te)
    g2.df <- data.frame(g2.mat[,"EnsembleID"],g2.mat[,"Groups"],factor(g2.mat[,"geno"],levels=alleles),as.double(g2.mat[,"Expression"]),g2.te)
    colnames(g1.df) <- colnames(g2.df) <- c("EnsembleID","Groups","geno","Expression","te")
    if (!RT){
        json.oper <- plot_ly(data=g1.df,x=~EnsembleID,text=~te,y=~Expression,color=~geno,type="box",jitter = 0.2, marker = list(size = 4),pointpos = 0,boxpoints=poi,visible=TRUE) %>%
            add_trace(data=g1.p.df,x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=FALSE) %>%
            add_trace(data=g2.df,x=~EnsembleID,text=~te,y=~Expression,color=~geno,type="box",jitter = 0.2, marker = list(size = 4),pointpos = 0,boxpoints=poi,visible=FALSE) %>%
            add_trace(data=g2.p.df,x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),
                visible=FALSE,mode='markers',inherit=FALSE) %>% rangeslider() %>%
            layout(updatemenus=g.an,boxmode = "group",xaxis=list(title="EnsembleID"),yaxis=list(title=tp))
        json.file <- plotly_json(json.oper,FALSE)
        write(json.file,paste("/var/lib/tomcat/genomics/rs/img/",uid,"_SNP.txt",sep=""))
        if (!length(return.string))    return ("Warning : There is no return")
        return (return.string)
    }
    g1.p.df[,1] <- unique(g1.df[,2])
    g2.p.df[,1] <- unique(g2.df[,2])
    g.df <- rbind(g1.df,g2.df)
    g.p.df <- rbind(g1.p.df,g2.p.df)
    json.oper <- plot_ly(data=g.df,x=~Groups,text=~te,y=~Expression,color=~geno,type="box",jitter = 0.2, marker = list(size = 4),pointpos = 0,boxpoints=poi,visible=TRUE) %>%
        add_trace(data=g.p.df,x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=FALSE) %>%
        layout(boxmode = "group",yaxis=list(title=tp))
    json.file <- plotly_json(json.oper,FALSE)
    write(json.file,paste("/var/lib/tomcat/genomics/rs/img/",uid,"_SNP.txt",sep=""))
    return (return.string)
}


me.mi.f <- function(oper.list){
    g1.txs <- oper.list$g1
    g2.txs <- oper.list$g2
    g1.samples <- oper.list$g1.s
    g2.samples <- oper.list$g2.s
    region.type <- oper.list$reg
    geneNM <- oper.list$gene
    data.dir <- oper.list$data.dir
    clinical.data <- oper.list$cli
    te.id <- oper.list$molid
    samcolid <- oper.list$id
    uid <- oper.list$uid
    .cn <- oper.list$cn
    total.txs <- unique(c(g1.txs,g2.txs))
    tx.exp <- NULL
    RT <- oper.list$"tp"
    tp <- "Expression: PSI"
    poi <- "all"
    xtp <- c(FALSE,"Groups")
    if (!RT){
        #if (length(unique(c(g1.txs,g2.txs))) > 5)    return ("Warning : Select less than 5 transcripts for the analysis")
        tp <- "Expression: TPM"
        poi <- "outlier"
        xtp <- c(TRUE,"EnsembleID")
    }
    vcf.nm <- c("NIA_JG_1898_samples_GRM_WGS_b37_JointAnalysis01_2017-12-08_",".recalibrated_variants.vcf.gz")
    exp.mat.re <- exp.make.f(oper.list)
    if (length(grep("Warning",exp.mat.re)))    return (exp.mat.re)
    exp.mat <- exp.mat.re[[1]]
    return.string <- exp.mat.re[[2]]
    te.dir <- paste(data.dir,"/ADAS/AD.methyl/",region.type,"/",sep="")
    if (length(grep("cg",te.id))){
        te.exp <- try(read.table(paste(data.dir,"/ADAS/AD.methyl/",region.type,"/",te.id,sep=""),sep="\t",header=T),silent=T)
        cn <- "Methylation"
        y.n <- "mwas_id"
    }
    else {
        te.exp <- try(read.table(paste(data.dir,"/ADAS/AD.miRNA/",region.type,"/",te.id,sep=""),sep="\t",header=T),silent=T)
        cn <- "miRNA"
        y.n <- "mirna_id"
    }
    if (length(grep("Error",te.exp)))    return (paste("Warning : There is no expression in ",te.id,sep=""))
    te.exp.mat <- cbind(gsub("[.]","-",colnames(te.exp)),unlist(matrix(te.exp,ncol=1)))
    te.exp.mat <- te.exp.mat[!is.na(as.double(te.exp.mat[,2])),]
    colnames(te.exp.mat) <- c("ID",cn)
    f.mer.mat <- unique(as.matrix(merge(te.exp.mat,exp.mat,by.x="ID",by.y=y.n)))
    g1.mat <- rbind(f.mer.mat[f.mer.mat[,"Groups"] == "Group A",])
    g2.mat <- rbind(f.mer.mat[f.mer.mat[,"Groups"] == "Group B",])
    if (!length(g1.mat))    return ("Warning : There is no testable samples of Group1")
    if (!length(g2.mat))    return ("Warning : There is no testable samples of Group2")
    g.p <- anno.make(f.mer.mat,TRUE)
    g.p.df <- data.frame(g.p[,1],g.p[,2],as.double(g.p[,3]))
    colnames(g.p.df) <- c("x","te","y")
    g.te <- cli.info(f.mer.mat,c("ID",.cn))
    g.df <- data.frame(f.mer.mat[,"EnsembleID"],f.mer.mat[,"Groups"],as.double(f.mer.mat[,cn]),as.double(f.mer.mat[,"Expression"]),g.te)
    colnames(g.df) <- c("EnsembleID","Groups",cn,"Expression","te")
    u.TXID <- as.matrix(unique(g.df[,1]))
    max.count <- 5.00001
    pos.nm <- as.integer(length(u.TXID)/max.count) + 1
    max.count <- as.integer(max.count)
    TXnm <- NULL
    for (pn in 1:pos.nm){
        if (pos.nm == 1){
            TXnm <- rbind(TXnm,c(1,length(u.TXID)))
            next
        }
        if (pn == pos.nm){
            TXnm <- rbind(TXnm,c(as.integer(max.count*(pn-1)+1),length(u.TXID)))
            next
        }
    TXnm <- rbind(TXnm,c(as.integer(max.count*(pn-1)+1),as.integer(max.count*(pn-1)+max.count)))
    }
    tru.fal <- c(rep(FALSE,4*length(u.TXID)),rep(FALSE,3*length(u.TXID)))
    updatemenus.oper <- NULL
    for (pn in 1:pos.nm){
        f.list.button <- NULL
        b.nm <- 1
        for (t in TXnm[pn,1]:TXnm[pn,2]){
            ea.tru.fal <- tru.fal
            ea.tru.fal[as.integer(t*3-2+4*length(u.TXID)):as.integer(t*3+4*length(u.TXID))] <- TRUE
            ea.tru.fal[as.integer(t*4-3):as.integer(t*4)] <- TRUE
            ea.tru.fal <- c(c(FALSE,FALSE,FALSE,FALSE),ea.tru.fal[1:as.integer(4*length(u.TXID))],c(FALSE,FALSE,FALSE),ea.tru.fal[as.integer(4*length(u.TXID)+1):length(ea.tru.fal)])
            ea.list.button <- list(label=u.TXID[t],method="update",args=list(list(visible=ea.tru.fal),list(title=u.TXID[t])))
            f.list.button[[b.nm]] <- ea.list.button
            b.nm <- b.nm + 1
        }
        pre.list <- list(active=-1,direction = "right",xanchor = 'center',yanchor = "bottom",x = 0.5,y = -(0.25+0.12*pn),size=10,type = "buttons",buttons = f.list.button,showactive=FALSE,font=list(size=12))
        updatemenus.oper[[pn]] <- pre.list
    }
    t.pv <- anno.make(g.df,TRUE,t.te=TRUE,exp.nm=cn)
    t.pv.df <- data.frame(t.pv[,1],t.pv[,2],as.double(t.pv[,3])*0.93)
    colnames(t.pv.df) <- c("x","te","y")
    total.lm <- lapply(u.TXID,function(x){
        ea.g.df <- g.df[g.df[,1] == x,]
        g1 <- try(lm(ea.g.df[ea.g.df[,2] == "Group A","Expression"] ~ ea.g.df[ea.g.df[,2] == "Group A",cn]),silent=T)
        g2 <- try(lm(ea.g.df[ea.g.df[,2] == "Group B","Expression"] ~ ea.g.df[ea.g.df[,2] == "Group B",cn]),silent=T)
        g1.p <- paste("p=",format(lmp(g1),scientific=T),"<BR>r2=",format(summary(g1)$adj.r.squared,scientific=T),sep="")
        g2.p <- paste("p=",format(lmp(g2),scientific=T),"<BR>r2=",format(summary(g2)$adj.r.squared,scientific=T),sep="")
        g1.mat <- cbind(ea.g.df[ea.g.df[,2] == "Group A",cn],fitted(g1),"Group A",g1.p,"Regression Line of Group1")
        g2.mat <- cbind(ea.g.df[ea.g.df[,2] == "Group B",cn],fitted(g2),"Group B",g2.p,"Regression Line of Group2")
        g.mat <- rbind(g1.mat,g2.mat)
        g.mat.df <- data.frame(as.double(g.mat[,1]),as.double(g.mat[,2]),g.mat[,3],g.mat[,4],g.mat[,5])
        colnames(g.mat.df) <- c("x","y","Groups","te","nm")
        g.mat.df
    })
    colnames(g.df)[colnames(g.df) == cn] <- "Methylation"
    hm <- as.integer(400 + 40 * pos.nm)
    wm <- 1200
    for (t in 1:length(u.TXID)){
        if (t == 1){
            j.o <- plot_ly(data=g.df[g.df[,1]==u.TXID[t],],x=~EnsembleID,text=~te,y=~Methylation,color=~Groups,type="box",height=hm,width=1000,
                jitter = 0.2,marker=list(size=2),pointpos=0,boxpoints="all",visible=TRUE) %>% layout(title=u.TXID[t]) %>%
                add_trace(data=t.pv.df[t.pv.df[,1]==u.TXID[t],],x=~x,y=~y,text=~te,type="scatter",name="Pvalue",hoverinfo="text",
                marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=FALSE,visible=TRUE)

            p <- plot_ly(data=g.df[g.df[,1]==u.TXID[t],],x=~Methylation,y=~Expression,color=~Groups,text=~te,type='scatter',
                visible=TRUE,hoverinfo='text',mode='markers') %>% layout(title=u.TXID[t]) %>% 
                add_lines(data=total.lm[[t]],x=~x,y=~y,color=~Groups,text=~te,visible=TRUE,opacity=0.6,inherit=FALSE,hoverinfo="text",name=~nm)
        }

        j.o <- j.o %>% add_trace(data=g.df[g.df[,1]==u.TXID[t],],x=~EnsembleID,text=~te,y=~Methylation,color=~Groups,
            type="box",jitter = 0.2,marker=list(size=2),pointpos=0,boxpoints="all",visible=FALSE)  %>% add_trace(data=t.pv.df[t.pv.df[,1]==u.TXID[t],],x=~x,y=~y,text=~te,type="scatter",
            name="Pvalue",hoverinfo="text",marker=list(opacity=0.8,symbol="star",size=6,color="darkred"),mode='markers',inherit=FALSE,visible=FALSE)

        p <- p %>% add_trace(data=g.df[g.df[,1]==u.TXID[t],],x=~Methylation,y=~Expression,color=~Groups,text=~te,type='scatter',visible=FALSE,hoverinfo='text',mode='markers') %>%
            add_lines(data=total.lm[[t]],x=~x,y=~y,color=~Groups,text=~te,visible=FALSE,opacity=0.6,inherit=FALSE,hoverinfo="text",name=~nm)
    }
    j.o <- j.o %>% layout(boxmode = "group",yaxis=list(title=cn),xaxis=list(showticklabels=xtp[1] == "TRUE",title=xtp[2]),title=list(text=xtp[1] == "TRUE"))
    p <- p %>% layout(yaxis=list(title=tp),xaxis=list(title=cn))
    if (!RT){
        j.o <- j.o %>% layout(updatemenus=updatemenus.oper)
        p <- p %>% layout(updatemenus=updatemenus.oper)
    }
    total.a <- subplot(p,j.o,nrows=1,widths = c(0.7,0.3),margin=0.04,titleY = TRUE, titleX=TRUE)
    json.file <- plotly_json(total.a,FALSE)
    write(json.file,paste("/var/lib/tomcat/genomics/rs/img/",uid,"_MEMI.txt",sep=""))
    return (return.string)
}








