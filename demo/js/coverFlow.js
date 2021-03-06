;(function($) {

    var cfWidth,
        spacing = 200,
        current = 0,
        _options = {};

    var screen = 1512;

    //widget element constructor
    function CoverFlowItem(id, image) {
        this.id = id;
        this.src = image;
        this.leftPosition = id*spacing;

        this._cfWrapper = $('.coverFlowWrapper');

        this.checkDimensions();
    }

    CoverFlowItem.prototype = {
        createDomItem: function createItem() {
            return "<div class='coverFlowItem c" + this.id + "'>" +
                "<img src='" + this.src + "' />" +
                "<canvas></canvas>" +
                "</div>";
        },
        checkDimensions: function checkDimensions() {
            var that = this,
                def = new $.Deferred();

            //calculate and store the final width showed in the DOM
            var img = new Image();
            img.onload = function() {
                that._width = this.width;
                that._height = this.height;
                that.calculatedWidth = Math.round(this.width*_options.height/this.height);

                def.resolve(that);
                if (_options.reflection) {
                    that.drawReflection(img);
                }
            };
            img.src = this.src;

            return def;
        },
        drawReflection: function reflection(image) {
            var canvas = this._cfWrapper.find(".c"+this.id).find("canvas")[0],
                ctx = canvas.getContext('2d'),
                gradient;

            canvas.height = _options.height;
            canvas.width = this.calculatedWidth;

            ctx.drawImage(image,0,0,this.calculatedWidth, _options.height);

            //set composite operation for gradient to make image opaque
            ctx.globalCompositeOperation = "destination-out";

            gradient = ctx.createLinearGradient(0,0,0,_options.height);
            gradient.addColorStop(0,"rgba(255,255,255,1)");
            gradient.addColorStop(1,"rgba(255,255,255,0.5)");

            ctx.fillStyle = gradient;
            ctx.rect(0, 0, this.calculatedWidth, _options.height);
            ctx.fill();
        }
    };


    //widget constructor
    function CoverFlow(element,options) {
        this.data = options.data;
        this.width = 0;

        this._element = element;
        this._items = [];
        this._size = this.data.length;
        this._middle = Math.floor(this._size/2);

        _options = {
            //TODO infinite
            infinite: options.infinite || false,
            reflection: options.reflection || false,
            perspective: options.perspective || 600,
            buttons: options.buttons || false,
            buttons_style: options.buttons_style || 'dark',
            height: options.height || 450
        };
        current = this._middle;
    }

    CoverFlow.prototype = {
        createWrapper: function createWrapper() {
            var wrapper = "<div class='coverFlowWrapper'></div>";

            this._element.addClass("coverFlow").html(wrapper);
            this._wrapper = this._element.children(".coverFlowWrapper");

            if (_options.buttons) this.createButtons();
            this.registerScrollEvents();
            this.registerDragEvents();
            this.registerTouchEvents();

            cfWidth = this._element.width();
        },
        initElements: function initElems() {
            var toAppend = '',
                that = this;

            for (var i=0, iMax=this._size; i < iMax; i++) {
                var item = new CoverFlowItem(i,this.data[i]),
                    elem = item.createDomItem(),
                    counter = 0;

                that._items.push(item);

                item.checkDimensions().then(function(j) {
                    counter++;
                    that.width += j.calculatedWidth;

                    var elem = that._wrapper.find(".c"+ j.id);
                    if (j.id < current) {
                        elem.addClass("leftItem").css({
                            'left': j.leftPosition,
                            'z-index': that._size - (current - j.id)
                        });
                    } else if (j.id > current) {
                        elem.addClass("rightItem").css({
                            'left': j.leftPosition,
                            'z-index': that._size - (j.id - current)
                        });
                    } else {
                        elem.addClass("highlight").css({
                            'left': j.leftPosition
                        });
                    }

                    if (counter == that._size) {
                        that._wrapper.css({
                            'left': cfWidth/2 - that._items[current].leftPosition,
                            'display': "block"
                        });
                    }
                });
                toAppend += elem;
            }

            this._wrapper.html(toAppend);

            //remove canvases if reflection is disabled
            if (!_options.reflection) {
                this._wrapper.find('canvas').remove();
            }
        },
        repaintElements: function repaintEls() {
            var classes = "highlight leftItem rightItem hidden",
                currentPos = this._items[current].leftPosition;

            for (var i=0, iMax=this._size; i < iMax; i++) {
                var object = this._items[i],
                    oLeftPos = object.leftPosition,
                    elem = this._wrapper.find(".c"+ object.id);

                if ((oLeftPos > currentPos - screen/2 - 2*spacing) && (oLeftPos < currentPos + screen/2 + 2*spacing)) {
                    if (oLeftPos < currentPos) {
                        elem.removeClass(classes)
                            .addClass("leftItem")
                            .css('left', oLeftPos)
                            .css('z-index', iMax - (current - object.id));
                    } else if (oLeftPos > currentPos) {
                        elem.removeClass(classes)
                            .addClass("rightItem")
                            .css('left', oLeftPos)
                            .css('z-index', iMax - (object.id - current));
                    } else {
                        elem.removeClass(classes)
                            .addClass("highlight")
                            .css('left', oLeftPos)
                            .css('z-index', 1000);
                    }
                } else {
                    elem.addClass('hidden');
                }
            }
        },
        createButtons: function createBtns() {
            var style = _options.buttons_style;
            var buttons = "<div class='btn "+style+" left'></div>" +
                "<div class='btn "+style+" right'></div>";

            this._element.append(buttons);
            this.registerBtnEvents();
        },
        registerBtnEvents: function registerBtnEvents() {
            var that = this,
                btnLeft = this._element.find(".btn.left"),
                btnRight = this._element.find(".btn.right");

            //click events
            btnLeft.bind('click', function(e) {
                e.preventDefault();
                that.slide(false,1);
            });
            btnRight.bind('click', function(e) {
                e.preventDefault();
                that.slide(true,1);
            });
        },
        registerScrollEvents: function registerScroll() {
            var that = this;
            //FF doesn't recognize mousewheel as of FF3.x
            var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
            this._element.bind(mousewheelevt, function(e){
                var evt = window.event || e;
                evt = evt.originalEvent ? evt.originalEvent : evt;
                //check for detail first, because it is used by Opera and FF
                var delta = evt.detail ? evt.detail*(-40) : evt.wheelDelta;

                delta < 0 ? that.slide(true,1) : that.slide(false,1);
            });
        },
        registerDragEvents: function registerDrag() {
            //TODO mouse drag scroll
            /*var that = this,
                dragging = false,
                startedOn = null;

            this._element.bind('mousedown', function(e) {
                dragging = true;
                startedOn = e.offsetX;
            });

            this._element.bind('mouseup', function(e) {
                dragging = false;
                startedOn = null;
            });

            this._element.bind('mousemove', function(e) {
                if (dragging) {
//                    console.log(startedOn - e.offsetX);

//                    that._wrapper.css('left', that._wrapper.position().left + startedOn - e.offsetX);
//                    startedOn = e.offsetX;
                }
            });*/
        },
        registerTouchEvents: function registerTouch() {
            //TODO touch scroll
            /*var that = this,
                dragging = false,
                counter = 0,
                startedOn = null;


            this._element.bind('touchstart', function(e) {
                e.preventDefault();
                dragging = true;
                startedOn = e.originalEvent.touches[0].clientX;
            });

            this._element.bind('touchmove', function(e) {
                e.preventDefault();
                if (dragging && !counter) {
                    var xPos = e.originalEvent.touches[0].clientX;

//                    console.log(xPos - startedOn);

                    that._wrapper.css('left', "+=" + (50*(xPos - startedOn)));
                    startedOn = xPos;
                }
                counter == 10 ? counter++ : counter = 0;
            });

            this._element.bind('touchend', function(e) {
                e.preventDefault();
                dragging = true;
                startedOn = null;
            });*/


            //TODO kinetic scroll
        },
        slide: function slide(direction,count) {
            if ( (!direction && current-count < 0) || (direction && current+count >= this._size) ) return;
            current += direction ? count : -count;

            var distance = direction ? -spacing : spacing;
            for (var i=0, iMax=this._size; i < iMax; i++) {
                var a = this._items[i];
                a.leftPosition += distance;
            }

            // TODO infinite
            if (_options.infinite) {
                if (direction) {

                } else {

                }
            }

            this.repaintElements();
        }
    };

    $.fn.coverFlow = function(options) {
        var cf = new CoverFlow(this, options);

        cf.createWrapper();
        cf.initElements();
    };
})(jQuery);
