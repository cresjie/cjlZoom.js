(function($){
	
	var counter = 1;

	$.fn.cjlZoom = function(opt){
		var defaults ={
			width:200,
			height:200,
			//size:{width:100,height:100},
			limitPositioning:false,
			distance :10,
			initZoom : 2,
			minZoom : 1.5,
			maxZoom : 10,
			style :'lens',
			//callbacks
			onShow:function(){},
			onClose:function(){}
		}


		var $currentImg,imageObject, $currentImg_offset;

		

		/* Execute in Constructor*/

		for(var k in opt)
			defaults[k] = opt[k];
		

		var $cjlZoom = $('<div class="cjl-zoom"></div>').addClass('cjl-zoom-'+counter + ' cjl-zoom-'+defaults.style);
		$('body').append( $cjlZoom);
		counter++;

		/* End in Constructor*/

		this.mouseenter(function(e){

			
			imageObject = new Image();
			imageObject.src = ( $(this).attr('data-img-large') ) ? $(this).attr('data-img-large') :$(this).attr('src');
			$('body').css('cursor','wait');
			var imgChk = setInterval(function(){
				if(imageObject.complete){
					clearInterval(imgChk);
					$('body').css('cursor','');
				}	
			},10);

			$currentImg = $(this);
			$currentImg_offset = $currentImg.offset();

			//check if loaded image has the same outer height for the current image
			//the loaded image should always be larger than the current image
			imageObject.width = $currentImg.outerWidth() * defaults.initZoom;
			imageObject.height = $currentImg.outerHeight() * defaults.initZoom;

			
			if(style[defaults.style]['init'])
				style[defaults.style]['init'](e);

			$('body').on('mousemove',_mouseMovement).on('mousewheel',disableBodyScrolling);

			//callback before showing
			defaults.onShow();
			$cjlZoom.css({
				'background-image' : 'url(' + imageObject.src +')',
				width : defaults.width,
				height : defaults.height

			}).fadeIn();
			
			
		});

		$cjlZoom.on('mousewheel',imageZooming);
		
		function imageZooming(e){

			if(e.originalEvent.wheelDelta > 0){
				imageObject.width = ( imageObject.width * 1.2 <= $currentImg.outerWidth()* defaults.maxZoom ) ? imageObject.width * 1.2 : imageObject.width;
				imageObject.height = ( imageObject.height * 1.2 <= $currentImg.outerHeight()* defaults.maxZoom ) ? imageObject.height * 1.2 : imageObject.height ;
			}else{
				
					imageObject.width = ( imageObject.width * .8 >= $currentImg.outerWidth()* defaults.minZoom ) ? imageObject.width * .8 : imageObject.width;
					imageObject.height = ( imageObject.height * .8 >= $currentImg.outerHeight()* defaults.minZoom ) ? imageObject.height * .8 : imageObject.height;
			}
			
			_imageZoomPositioning(e);
		}

		function _mouseMovement(e){
			
			if(e.pageX >= $currentImg_offset.left && e.pageX <= $currentImg.offset().left+$currentImg.outerWidth() && // dimension X
				e.pageY >= $currentImg.offset().top && e.pageY <= $currentImg.offset().top + $currentImg.outerHeight() ){	// dimension Y

				if( style[defaults.style]['onmousemove'] )
					style[defaults.style]['onmousemove'](e);

				//_imageZoomPositioning(e);

			}else{ // out of image dimension
				//callback before close
				defaults.onClose();
				$cjlZoom.fadeOut();
				$('body').off('mousemove',_mouseMovement).off('mousewheel',disableBodyScrolling);

				if(style[defaults.style]['onclose'])
					style[defaults.style]['onclose']();
			}
		}

		function _imageZoomPositioning(e){
			//get the percentage value of the location
				var perX = (e.pageX - $currentImg_offset.left) / $currentImg.outerWidth(), //.45
					perY = (e.pageY - $currentImg_offset.top) / $currentImg.outerHeight(),
					bgX = -( (perX * imageObject.width) - (defaults.width/2) ),
					bgY = -( (perY * imageObject.height) -  (defaults.height/2) );
				if(defaults.limitPositioning){	
					if(bgX > 0)
						bgX =0;
					else if(bgX < -(imageObject.width - $cjlZoom.outerWidth()) )
						bgX = -(imageObject.width - $cjlZoom.outerWidth());
					if(bgY > 0)
						bgY = 0;
					else if(bgY < - (imageObject.height - $cjlZoom.outerHeight()) )
						bgY = - (imageObject.height - $cjlZoom.outerHeight());
				}
				//lens movement
				$cjlZoom.css({
					'background-position' : bgX + 'px ' + bgY + 'px',
					'background-size' : imageObject.width+'px ' + imageObject.height+'px'
				});

		}

		function disableBodyScrolling(e){
			e.preventDefault();
		}

		var style = {
			lens : {

				onmousemove: function(e){
					
					$cjlZoom.css({
						top: e.pageY - (defaults.height/2),
						left : e.pageX - (defaults.width/2),
					});
					_imageZoomPositioning(e);
				}
			},

			overlay : {
				init : function(e){
					defaults.limitPositioning =true;
					defaults.width = $currentImg.outerWidth();
					defaults.height = $currentImg.outerHeight();
					$cjlZoom.css({
						top: $currentImg_offset.top,
						left: $currentImg_offset.left,
						width : defaults.width,
						height :defaults.height
					});
				},
				onmousemove:_imageZoomPositioning,
				onmousemove2:function(e){
					//get the percentage value of the location
					var perX = (e.pageX - $currentImg_offset.left) / ($currentImg.outerWidth()*2 ), //.45
						perY = (e.pageY - $currentImg_offset.top) / $currentImg.outerHeight(),
						bgX = (perX * imageObject.width), //- (defaults.width/2),
						bgY = (perY * imageObject.height); //-  (defaults.height/2);
					console.log(perX);
					//lens movement
					$cjlZoom.css({
						'background-position' : -bgX + 'px ' + -bgY + 'px',
						'background-size' : imageObject.width+'px ' + imageObject.height+'px'
					});
				}
			},

			outside: {
				init:function(e){
					defaults.limitPositioning =true;
					var top,left;
					//positioning
					if( $currentImg_offset.left >= $cjlZoom.outerWidth() + defaults.distance ){ //left
						left = $currentImg_offset.left - ($cjlZoom.outerWidth() + defaults.distance);
						top = $currentImg_offset.top;
						this.containerPosition = 'left';
					}else if( ( $('body').outerWidth() - ($currentImg_offset.left+$currentImg.outerWidth() ) )  >= $cjlZoom.outerWidth() + defaults.distance ){ //right
						left = $currentImg_offset.left + $currentImg.outerWidth() + defaults.distance;
						top = $currentImg_offset.top;
						this.containerPosition = 'right';
					}else if( $currentImg_offset.top >= $cjlZoom.outerHeight() + defaults.distance ){ //top
						left = $currentImg_offset.left;
						top = $currentImg_offset.top - ($cjlZoom.outerHeight()+ defaults.distance );
						this.containerPosition = 'top';
					}else /*if( $('body').outerHeight() -  ($currentImg_offset.top + $currentImg.outerHeight() ) >= $cjlZoom.height() + defaults.distance )*/{ //down
						left = $currentImg_offset.left;
						top = $currentImg_offset.top + $currentImg.outerHeight() + defaults.distance;
						this.containerPosition = 'bottom';
					}
					
					

					$cjlZoom.css({
						top : top,
						left : left,
					}).addClass('cjl-zoom-'+this.containerPosition);
					
					$currentImg.on('mousewheel',imageZooming);

				},
				onmousemove:_imageZoomPositioning,
				onclose: function(){
					$currentImg.off('mousewheel',imageZooming);
					$cjlZoom.removeClass('cjl-zoom-'+this.containerPosition);
				}
			}
		}


	return this;
	}



})(jQuery,window);