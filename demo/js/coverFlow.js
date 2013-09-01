;(function($) {

    var cfWidth,
        height = 450,
        spacing = 200,
        current = 0,
        _options = {};

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
                that.calculatedWidth = Math.round(this.width*height/this.height);

                def.resolve(that);
//                if (_options.reflection) that.drawReflection(img);
                that.drawReflection(img);
            };
            img.src = this.src;

            return def;
        },
        drawReflection: function reflection(image) {
            var canvas = this._cfWrapper.find(".c"+this.id).find("canvas")[0],
                ctx = canvas.getContext('2d'),
                gradient;

            canvas.height = height;
            canvas.width = this.calculatedWidth;

            ctx.drawImage(image,0,0,this.calculatedWidth, height);

            //set composite operation for gradient to make image opaque
            ctx.globalCompositeOperation = "destination-out";

            gradient = ctx.createLinearGradient(0,0,0,height);
            gradient.addColorStop(0,"rgba(255,255,255,1)");
            gradient.addColorStop(1,"rgba(255,255,255,0.5)");

            ctx.fillStyle = gradient;
            ctx.rect(0, 0, this.calculatedWidth, height);
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


        //TODO options
        _options = {
            //TODO infinite
            infinite: options.infinite || false,
            reflection: options.reflection || true,
            perspective: options.perspective || 600,
            buttons: options.buttons || false
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
            //this.registerDragEvents();

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
                        elem.addClass("leftItem")
                            .css({
                                'left': j.leftPosition,
                                'z-index': that._size - (current - j.id)
                            });
                    } else if (j.id > current) {
                        elem.addClass("rightItem")
                            .css({
                                'left': j.leftPosition,
                                'z-index': that._size - (j.id - current)
                            });
                    } else {
                        elem.addClass("highlight")
                            .css({
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
        },
        repaintElements: function repaintEls() {
            var classes = "highlight leftItem rightItem";

            for (var i=0, iMax=this._size; i < iMax; i++) {
                var object = this._items[i],
                    elem = this._wrapper.find(".c"+ object.id);

                if (i < current) {
                    if (elem.is(":visible")) {
                        elem.removeClass(classes)
                            .addClass("leftItem")
                            .css('z-index', iMax - (current - object.id));
                    }
                } else if (i > current) {
                    elem.removeClass(classes)
                        .addClass("rightItem")
                        .css('z-index', iMax - (object.id - current));
                } else {
                    elem.removeClass(classes)
                        .addClass("highlight")
                        .css('z-index', iMax*2);
                }
            }
        },
        createButtons: function createBtns() {
            var buttons = "<div class='btn left'></div>" +
                "<div class='btn right'></div>";

            this._element.append(buttons);
            this.registerBtnEvents();
        },
        registerBtnEvents: function registerBtnEvents() {
            var that = this,
                btnLeft = this._element.find(".btn.left"),
                btnRight = this._element.find(".btn.right");

            //click events
            btnLeft.bind('click', function(e) {
                e.preventDefault().stopPropagation();
                that.slide(false,1);
            });
            btnRight.bind('click', function(e) {
                e.preventDefault().stopPropagation();
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
            //TODO register drag
            var that = this,
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
            });
        },
        registerTouchEvents: function registerTouch() {
            //TODO touch scroll

            //TODO kinetic scroll
        },
        slide: function slide(direction,count) {
            if ( (!direction && current-count < 0) || (direction && current+count >= this._size) ) return;
            current += direction ? count : -count;

            var newPosition = cfWidth/2 - this._items[this._middle].leftPosition
                + (this._middle - current)*spacing;

            this.repaintElements();
            this._wrapper.css({
                "left": newPosition
            })
        }
    };

    $.fn.coverFlow = function(options) {
        var cf = new CoverFlow(this, options);

        cf.createWrapper();
        cf.initElements();
    };
})(jQuery);
