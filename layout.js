(function (scope, bundled) {
	
	var   enyo     = scope.enyo || (scope.enyo = {})
		, manifest = enyo.__manifest__ || (defineProperty(enyo, '__manifest__', {value: {}}) && enyo.__manifest__)
		, exported = enyo.__exported__ || (defineProperty(enyo, '__exported__', {value: {}}) && enyo.__exported__)
		, require  = enyo.require || (defineProperty(enyo, 'require', {value: enyoRequire}) && enyo.require)
		, local    = bundled()
		, entries;

	// below is where the generated entries list will be assigned if there is one
	entries = null;


	if (local) {
		Object.keys(local).forEach(function (name) {
			var value = local[name];
			if (manifest.hasOwnProperty(name)) {
				if (!value || !(value instanceof Array)) return;
			}
			manifest[name] = value;
		});
	}

	function defineProperty (o, p, d) {
		if (Object.defineProperty) return Object.defineProperty(o, p, d);
		o[p] = d.value;
		return o;
	}
	
	function enyoRequire (target) {
		if (!target || typeof target != 'string') return undefined;
		if (exported.hasOwnProperty(target))      return exported[target];
		var   request = enyo.request
			, entry   = manifest[target]
			, exec
			, map
			, ctx
			, reqs
			, reqr;
		if (!entry) throw new Error('Could not find module "' + target + '"');
		if (!(entry instanceof Array)) {
			if (typeof entry == 'object' && (entry.source || entry.style)) {
				throw new Error('Attempt to require an asynchronous module "' + target + '"');
			} else if (typeof entry == 'string') {
				throw new Error('Attempt to require a bundle entry "' + target + '"');
			} else {
				throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
			}
		}
		exec = entry[0];
		map  = entry[1];
		if (typeof exec != 'function') throw new Error('The shared module manifest has been corrupted, the module is invalid "' + target + '"');
		ctx  = {exports: {}};
		if (request) {
			if (map) {
				reqs = function (name) {
					return request(map.hasOwnProperty(name) ? map[name] : name);
				};
				defineProperty(reqs, 'isRequest', {value: request.isRequest});
			} else reqs = request;
		}
		reqr = !map ? require : function (name) {
			return require(map.hasOwnProperty(name) ? map[name] : name);
		};
		exec(
			ctx,
			ctx.exports,
			scope,
			reqr,
			reqs
		);
		return exported[target] = ctx.exports;
	}

	// in occassions where requests api are being used, below this comment that implementation will
	// be injected
	

	// if there are entries go ahead and execute them
	if (entries && entries.forEach) entries.forEach(function (name) { require(name); });
})(this, function () {
	// this allows us to protect the scope of the modules from the wrapper/env code
	return {'layout/Arranger':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/Arranger~Arranger} kind.
* @module layout/Arranger
*/

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	platform = require('enyo/platform');

var
	Layout = require('enyo/Layout'),
	Dom = require('enyo/dom');

/**
* {@link module:layout/Arranger~Arranger} is an {@link module:enyo/Layout~Layout} that considers one of the
* controls it lays out as active. The other controls are placed relative to
* the active control as makes sense for the layout.
*
* `layout/Arranger` supports dynamic layouts, meaning it's possible to transition
* between an arranger's layouts	via animation. Typically, arrangers should lay out
* controls using CSS transforms, since these are optimized for animation. To
* support this, the controls in an arranger are absolutely positioned, and
* the Arranger kind has an [accelerated]{@link module:layout/Arranger~Arranger#accelerated} property,
* which marks controls for CSS compositing. The default setting of `'auto'` ensures
* that this will occur if enabled by the platform.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class Arranger
* @extends module:enyo/Layout~Layout
* @public
*/
var Arranger = module.exports = kind(
	/** @lends module:layout/Arranger~Arranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Arranger',

	/**
	* @private
	*/
	kind: Layout,

	/**
	* @private
	*/
	layoutClass: 'enyo-arranger',

	/**
	* Flag indicating whether the Arranger should lay out controls using CSS
	* compositing. The default setting `('auto')` will mark controls for compositing
	* if the platform supports it.
	*
	* @type {String|Boolean}
	* @default 'auto'
	* @protected
	*/
	accelerated: 'auto',

	/**
	* A property of the drag event, used to calculate the amount that a drag will
	* move the layout.
	*
	* @type {String}
	* @default 'ddx'
	* @private
	*/
	dragProp: 'ddx',

	/**
	* A property of the drag event, used to calculate the direction of the drag.
	*
	* @type {String}
	* @default 'xDirection'
	* @private
	*/
	dragDirectionProp: 'xDirection',

	/**
	* A property of the drag event, used to calculate whether a drag should occur.
	*
	* @type {String}
	* @default 'horizontal'
	* @private
	*/
	canDragProp: 'horizontal',

	/**
	* If set to `true`, transitions between non-adjacent arrangements will go
	* through the intermediate arrangements. This is useful when direct
	* transitions between arrangements would be visually jarring.
	*
	* @type {Boolean}
	* @default false
	* @protected
	*/
	incrementalPoints: false,

	/**
	* Called when removing an arranger (e.g., when switching a Panels control to a
	* different `arrangerKind`). Subkinds should implement this function to reset
	* whatever properties they've changed on child controls. Note that you **must**
	* call the superkind implementation in your subkind's `destroy()` function.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c._arranger = null;
			}
			sup.apply(this, arguments);
		};
	}),

	/**
	* Arranges the given array of `controls` in the layout specified by `index`. When
	* implementing this method, rather than applying styling directly to controls, call
	* [arrangeControl()]{@link module:layout/Arranger~Arranger#arrangeControl} and pass in an arrangement
	* object with styling settings. The styles will then be applied via
	* [flowControl()]{@link module:layout/Arranger~Arranger#flowControl}.
	*
	* @param {module:enyo/Control~Control[]} controls
	* @param {Number} index
	* @virtual
	* @protected
	*/
	arrange: function (controls, index) {
	},

	/**
	* Sizes the controls in the layout. This method is called only at reflow time.
	* Note that the sizing operation has been separated from the layout done in
	* [arrange()]{@link module:layout/Arranger~Arranger#arrange} because it is expensive and not suitable
	* for dynamic layout.
	*
	* @virtual
	* @protected
	*/
	size: function () {
	},

	/**
	* Called when a layout transition begins. Implement this method to perform
	* tasks that should only occur when a transition starts; for example, some
	* controls might be shown or hidden. In addition, the `transitionPoints`
	* array may be set on the container to dictate the named arrangements
	* between which the transition occurs.
	*
	* @protected
	*/
	start: function () {
		var f = this.container.fromIndex, t = this.container.toIndex;
		var p$ = this.container.transitionPoints = [f];
		// optionally add a transition point for each index between from and to.
		if (this.incrementalPoints) {
			var d = Math.abs(t - f) - 2;
			var i = f;
			while (d >= 0) {
				i = i + (t < f ? -1 : 1);
				p$.push(i);
				d--;
			}
		}
		p$.push(this.container.toIndex);
	},

	/**
	* Called when a layout transition completes. Implement this method to
	* perform tasks that should only occur when a transition ends; for
	* example, some controls might be shown or hidden.
	*
	* @virtual
	* @protected
	*/
	finish: function () {
	},

	/**
	* Called when dragging the layout, this method returns the difference in
	* pixels between the arrangement `a0` for layout setting `i0`	and
	* arrangement `a1` for layout setting `i1`. This data is used to calculate
	* the percentage that a drag should move the layout between two active states.
	*
	* @param {Number} i0 - The initial layout setting.
	* @param {Object} a0 - The initial arrangement.
	* @param {Number} i1 - The target layout setting.
	* @param {Object} a1 - The target arrangement.
	* @virtual
	* @protected
	*/
	calcArrangementDifference: function (i0, a0, i1, a1) {
	},

	/**
	* @private
	*/
	canDragEvent: function (event) {
		return event[this.canDragProp];
	},

	/**
	* @private
	*/
	calcDragDirection: function (event) {
		return event[this.dragDirectionProp];
	},

	/**
	* @private
	*/
	calcDrag: function (event) {
		return event[this.dragProp];
	},

	/**
	* @private
	*/
	drag: function (dp, an, a, bn, b) {
		var f = this.measureArrangementDelta(-dp, an, a, bn, b);
		return f;
	},

	/**
	* @private
	*/
	measureArrangementDelta: function (x, i0, a0, i1, a1) {
		var d = this.calcArrangementDifference(i0, a0, i1, a1);
		var s = d ? x / Math.abs(d) : 0;
		s = s * (this.container.fromIndex > this.container.toIndex ? -1 : 1);
		return s;
	},

	/**
	* Arranges the panels, with the panel at `index` being designated as active.
	*
	* @param  {Number} index - The index of the active panel.
	* @private
	*/
	_arrange: function (index) {
		// guard against being called before we've been rendered
		if (!this.containerBounds) {
			this.reflow();
		}
		var c$ = this.getOrderedControls(index);
		this.arrange(c$, index);
	},

	/**
	* Arranges `control` according to the specified `arrangement`.
	*
	* Note that this method doesn't actually modify `control` but rather sets the
	* arrangement on a private member of the control to be retrieved by
	* {@link module:layout/Panels~Panels}.
	*
	* @param  {module:enyo/Control~Control} control
	* @param  {Object} arrangement
	* @private
	*/
	arrangeControl: function (control, arrangement) {
		control._arranger = utils.mixin(control._arranger || {}, arrangement);
	},

	/**
	* Called before HTML is rendered. Applies CSS to panels to ensure GPU acceleration if
	* [accelerated]{@link module:layout/Arranger~Arranger#accelerated} is `true`.
	*
	* @private
	*/
	flow: function () {
		this.c$ = [].concat(this.container.getPanels());
		this.controlsIndex = 0;
		for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]); i++) {
			Dom.accelerate(c, !c.preventAccelerate && this.accelerated);
			if (platform.safari) {
				// On Safari-desktop, sometimes having the panel's direct child set to accelerate isn't sufficient
				// this is most often the case with Lists contained inside another control, inside a Panels
				var grands=c.children;
				for (var j=0, kid; (kid=grands[j]); j++) {
					Dom.accelerate(kid, this.accelerated);
				}
			}
		}
	},

	/**
	* Called during "rendered" phase to [size]{@link module:layout/Arranger~Arranger#size} the controls.
	*
	* @private
	*/
	reflow: function () {
		var cn = this.container.hasNode();
		this.containerBounds = cn ? {width: cn.clientWidth, height: cn.clientHeight} : {};
		this.size();
	},

	/**
	* If the {@link module:layout/Panels~Panels} has an arrangement, flows each control according to that
	* arrangement.
	*
	* @private
	*/
	flowArrangement: function () {
		var a = this.container.arrangement;
		if (a) {
			for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]) && (a[i]); i++) {
				this.flowControl(c, a[i]);
			}
		}
	},
	/**
	* Lays out the given `control` according to the settings stored in the
	* `arrangement` object. By default, `flowControl()` will apply settings for
	* `left`, `top`, and `opacity`. This method should only be implemented to apply
	* other settings made via [arrangeControl()]{@link module:layout/Arranger~Arranger#arrangeControl}.
	*
	* @param {module:enyo/Control~Control} control - The control to be laid out.
	* @param {Object} arrangement - An object whose members specify the layout settings.
	* @protected
	*/
	flowControl: function (control, arrangement) {
		Arranger.positionControl(control, arrangement);
		var o = arrangement.opacity;
		if (o != null) {
			Arranger.opacifyControl(control, o);
		}
	},

	/**
	* Gets an array of controls arranged in state order.
	* note: optimization, dial around a single array.
	*
	* @param  {Number} index     - The index of the active panel.
	* @return {module:enyo/Control~Control[]}   - Ordered array of controls.
	* @private
	*/
	getOrderedControls: function (index) {
		var whole = Math.floor(index);
		var a = whole - this.controlsIndex;
		var sign = a > 0;
		var c$ = this.c$ || [];
		for (var i=0; i<Math.abs(a); i++) {
			if (sign) {
				c$.push(c$.shift());
			} else {
				c$.unshift(c$.pop());
			}
		}
		this.controlsIndex = whole;
		return c$;
	}
});

/**
* Positions a control via transform--`translateX/translateY` if supported,
* falling back to `left/top` if not.
*
* @lends module:layout/Arranger~Arranger
* @param  {module:enyo/Control~Control} control - The control to position.
* @param  {Object} bounds        - The new bounds for `control`.
* @param  {String} unit          - The unit for `bounds` members.
* @public
*/
Arranger.positionControl = function (control, bounds, unit) {
	unit = unit || 'px';
	if (!this.updating) {
		// IE10 uses setBounds because of control hit caching problems seem in some apps
		if (Dom.canTransform() && !control.preventTransform && platform.ie !== 10) {
			var l = bounds.left, t = bounds.top;
			l = utils.isString(l) ? l : l && (l + unit);
			t = utils.isString(t) ? t : t && (t + unit);
			Dom.transform(control, {translateX: l || null, translateY: t || null});
		} else {
			// If a previously positioned control has subsequently been marked with
			// preventTransform, we need to clear out any old translation values.
			if (Dom.canTransform() && control.preventTransform) {
				Dom.transform(control, {translateX: null, translateY: null});
			}
			control.setBounds(bounds, unit);
		}
	}
};

/**
* Sets the opacity value for a given control.
*
* @lends module:layout/Arranger~Arranger
* @param {module:enyo/Control~Control} inControl - The control whose opacity is to be set.
* @param {Number} inOpacity - The new opacity value for the control.
* @public
*/
Arranger.opacifyControl = function (inControl, inOpacity) {
	// FIXME: very high/low settings of opacity can cause a control to
	// blink so cap this here.
	inControl.applyStyle('opacity', inOpacity > 0.99 ? 1 : (inOpacity < 0.01 ? 0 : inOpacity));
};

}],'layout/ContextualLayout':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/ContextualLayout~ContextualLayout} kind.
* @module layout/ContextualLayout
*/

var
    kind = require('enyo/kind'),
    Layout = require('enyo/Layout');

/**
* {@link module:layout/ContextualLayout~ContextualLayout} provides the base
* positioning logic for a contextual layout strategy. This layout strategy is
* intended for use with a popup in a decorator/activator scenario, in which the
* popup is positioned relative to the activator, e.g.:
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		ContextualPopup = require('onyx/ContextualPopup'),
* 		ContextualPopupDecorator = require('onyx/ContextualPopupDecorator');
*
* 	{kind: ContextualPopupDecorator, components: [
* 		{content: 'Show Popup'},
* 		{kind: ContextualPopup,
* 			title: 'Sample Popup',
* 			actionButtons: [
* 				{content: 'Button 1', classes: 'onyx-button-warning'},
* 				{content: 'Button 2'}
* 			],
* 			components: [
* 				{content: 'Sample component in popup'}
* 			]
* 		}
* 	]}
* ```
*
* The decorator contains the popup and activator, with the activator being the
* first child component (i.e., the "Show Popup" button). The contextual layout
* strategy is applied because, in the definition of `onyx/ContextualPopup`,
* its `layoutKind` property is set to `onyx/ContextualLayout`.
*
* Note that a popup using ContextualLayout as its `layoutKind` is expected to
* declare several specific properties:
*
* - `vertFlushMargin` - The vertical flush layout margin, i.e., how close the
* popup's edge may come to the vertical screen edge (in pixels) before
* being laid out "flush" style.
* - `horizFlushMargin` - The horizontal flush layout margin, i.e., how close
* the popup's edge may come to the horizontal screen edge (in pixels)
* before being laid out "flush" style.
* - `widePopup` - A popup wider than this value (in pixels) is considered wide
* for layout calculation purposes.
* - `longPopup` - A popup longer than this value (in pixels) is considered long
* for layout calculation purposes.
* - `horizBuffer` - Horizontal flush popups are not allowed within this buffer
* area (in pixels) on the left or right screen edge.
* - `activatorOffset` - The popup activator's offset on the page (in pixels);
* this should be calculated whenever the popup is to be shown.
*
* @class ContextualLayout
* @extends module:enyo/Layout~Layout
* @public
*/

module.exports = kind(
    /** @lends module:layout/ContextualLayout~ContextualLayout.prototype */ {

    /**
    * @private
    */
    name: 'enyo.ContextualLayout',

    /**
	* @private
	*/
    kind: Layout,

    /**
    * Adjusts the popup's position, as well as the nub location and direction.
    *
    * @public
    */
    adjustPosition: function () {
        if (this.container.showing && this.container.hasNode()) {
            /****ContextualPopup positioning rules:
                1. Activator Location:
                    a. If activator is located in a corner then position using a flush style.
                        i.  Attempt vertical first.
                        ii. Horizontal if vertical doesn't fit.
                    b. If not in a corner then check if the activator is located in one of the 4 "edges" of the view & position the
                        following way if so:
                        i.   Activator is in top edge, position popup below it.
                        ii.  Activator is in bottom edge, position popup above it.
                        iii. Activator is in left edge, position popup to the right of it.
                        iv.  Activator is in right edge, position popup to the left of it.

                2. Screen Size - the pop-up should generally extend in the direction where there’s room for it.
                    Note: no specific logic below for this rule since it is built into the positioning functions, ie we attempt to never
                    position a popup where there isn't enough room for it.

                3. Popup Size:
                    i.  If popup content is wide, use top or bottom positioning.
                    ii. If popup content is long, use horizontal positioning.

                4. Favor top or bottom:
                    If all the above rules have been followed and location can still vary then favor top or bottom positioning.

                5. If top or bottom will work, favor bottom.
                    Note: no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
                    use a bottom position for the popup as much possible. Additionally within the vetical position function we center the
                    popup if the activator is at the vertical center of the view.
            ****/
            this.resetPositioning();
            var innerWidth = this.getViewWidth();
            var innerHeight = this.getViewHeight();

            //These are the view "flush boundaries"
            var topFlushPt = this.container.vertFlushMargin;
            var bottomFlushPt = innerHeight - this.container.vertFlushMargin;
            var leftFlushPt = this.container.horizFlushMargin;
            var rightFlushPt = innerWidth - this.container.horizFlushMargin;

            //Rule 1 - Activator Location based positioning
            //if the activator is in the top or bottom edges of the view, check if the popup needs flush positioning
            if ((this.offset.top + this.offset.height) < topFlushPt || this.offset.top > bottomFlushPt) {
                //check/try vertical flush positioning	(rule 1.a.i)
                if (this.applyVerticalFlushPositioning(leftFlushPt, rightFlushPt)) {
                    return;
                }

                //if vertical doesn't fit then check/try horizontal flush (rule 1.a.ii)
                if (this.applyHorizontalFlushPositioning(leftFlushPt, rightFlushPt)) {
                    return;
                }

                //if flush positioning didn't work then try just positioning vertically (rule 1.b.i & rule 1.b.ii)
                if (this.applyVerticalPositioning()){
                    return;
                }
            //otherwise check if the activator is in the left or right edges of the view & if so try horizontal positioning
            } else if ((this.offset.left + this.offset.width) < leftFlushPt || this.offset.left > rightFlushPt) {
                //if flush positioning didn't work then try just positioning horizontally (rule 1.b.iii & rule 1.b.iv)
                if (this.applyHorizontalPositioning()){
                    return;
                }
            }

            //Rule 2 - no specific logic below for this rule since it is inheritent to the positioning functions, ie we attempt to never
            //position a popup where there isn't enough room for it.

            //Rule 3 - Popup Size based positioning
            var clientRect = this.getBoundingRect(this.container.node);

            //if the popup is wide then use vertical positioning
            if (clientRect.width > this.container.widePopup) {
                if (this.applyVerticalPositioning()){
                    return;
                }
            }
            //if the popup is long then use horizontal positioning
            else if (clientRect.height > this.container.longPopup) {
                if (this.applyHorizontalPositioning()){
                    return;
                }
            }

            //Rule 4 - Favor top or bottom positioning
            if (this.applyVerticalPositioning()) {
                return;
            }
            //but if thats not possible try horizontal
            else if (this.applyHorizontalPositioning()){
                return;
            }

            //Rule 5 - no specific logic below for this rule since it is built into the vertical position functions, ie we attempt to
            //         use a bottom position for the popup as much possible.
        }
    },
    //

    /**
    * Determines whether the popup will fit onscreen if moved below or above the activator.
    *
    * @return {Boolean} `true` if popup will fit onscreen; otherwise, `false`.
    * @public
    */
    initVerticalPositioning: function () {
        this.resetPositioning();
        this.container.addClass('vertical');

        var clientRect = this.getBoundingRect(this.container.node);
        var innerHeight = this.getViewHeight();

        if (this.container.floating){
            if (this.offset.top < (innerHeight / 2)) {
                this.applyPosition({top: this.offset.top + this.offset.height, bottom: 'auto'});
                this.container.addClass('below');
            } else {
                this.applyPosition({top: this.offset.top - clientRect.height, bottom: 'auto'});
                this.container.addClass('above');
            }
        } else {
            //if the popup's bottom goes off the screen then put it on the top of the invoking control
            if ((clientRect.top + clientRect.height > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))){
                this.container.addClass('above');
            } else {
                this.container.addClass('below');
            }
        }

        //if moving the popup above or below the activator puts it past the edge of the screen then vertical doesn't work
        clientRect = this.getBoundingRect(this.container.node);
        if ((clientRect.top + clientRect.height) > innerHeight || clientRect.top < 0){
            return false;
        }

        return true;
    },

    /**
    * Moves the popup below or above the activating control.
    *
    * @return {Boolean} `false` if popup was not moved because it would not fit onscreen
    * in the new position; otherwise, `true`.
    * @public
    */
    applyVerticalPositioning: function () {
        //if we can't fit the popup above or below the activator then forget vertical positioning
        if (!this.initVerticalPositioning()) {
            return false;
        }

        var clientRect = this.getBoundingRect(this.container.node);
        var innerWidth = this.getViewWidth();

        if (this.container.floating){
            //Get the left edge delta to horizontally center the popup
            var centeredLeft = this.offset.left + this.offset.width/2 - clientRect.width/2;
            if (centeredLeft + clientRect.width > innerWidth) {//popup goes off right edge of the screen if centered
                this.applyPosition({left: this.offset.left + this.offset.width - clientRect.width});
                this.container.addClass('left');
            } else if (centeredLeft < 0) {//popup goes off left edge of the screen if centered
                this.applyPosition({left:this.offset.left});
                this.container.addClass('right');
            } else {//center the popup
                this.applyPosition({left: centeredLeft});
            }

        } else {
            //Get the left edge delta to horizontally center the popup
            var centeredLeftDelta = this.offset.left + this.offset.width/2 - clientRect.left - clientRect.width/2;
            if (clientRect.right + centeredLeftDelta > innerWidth) {//popup goes off right edge of the screen if centered
                this.applyPosition({left: this.offset.left + this.offset.width - clientRect.right});
                this.container.addRemoveClass('left', true);
            } else if (clientRect.left + centeredLeftDelta < 0) {//popup goes off left edge of the screen if centered
                this.container.addRemoveClass('right', true);
            } else {//center the popup
                this.applyPosition({left: centeredLeftDelta});
            }
        }

        return true;
    },

    /**
    * Positions the popup vertically flush with the activating control.
    *
    * @param {Number} leftFlushPt - Left side cutoff.
    * @param {Number} rightFlushPt - Right side cutoff.
    * @return {Boolean} `false` if popup will not fit onscreen in new position;
    * otherwise, `true`.
    * @public
    */
    applyVerticalFlushPositioning: function (leftFlushPt, rightFlushPt) {
        //if we can't fit the popup above or below the activator then forget vertical positioning
        if (!this.initVerticalPositioning()) {
            return false;
        }

        var clientRect = this.getBoundingRect(this.container.node);
        var innerWidth = this.getViewWidth();

        //If the activator's right side is within our left side cut off use flush positioning
        if ((this.offset.left + this.offset.width/2) < leftFlushPt){
            //if the activator's left edge is too close or past the screen left edge
            if (this.offset.left + this.offset.width/2 < this.container.horizBuffer){
                this.applyPosition({left:this.container.horizBuffer + (this.container.floating ? 0 : -clientRect.left)});
            } else {
                this.applyPosition({left:this.offset.width/2  + (this.container.floating ? this.offset.left : 0)});
            }

            this.container.addClass('right');
            this.container.addClass('corner');
            return true;
        }
        //If the activator's left side is within our right side cut off use flush positioning
        else if (this.offset.left + this.offset.width/2 > rightFlushPt) {
            if ((this.offset.left+this.offset.width/2) > (innerWidth-this.container.horizBuffer)){
                this.applyPosition({left:innerWidth - this.container.horizBuffer - clientRect.right});
            } else {
                this.applyPosition({left: (this.offset.left + this.offset.width/2) - clientRect.right});
            }
            this.container.addClass('left');
            this.container.addClass('corner');
            return true;
        }

        return false;
    },

    /**
    * Determines whether popup will fit onscreen if moved to the left or right of the
    * activator.
    *
    * @return {Boolean} `true` if the popup will fit onscreen; otherwise, `false`.
    * @public
    */
    initHorizontalPositioning: function () {
        this.resetPositioning();

        var clientRect = this.getBoundingRect(this.container.node);
        var innerWidth = this.getViewWidth();

        //adjust horizontal positioning of the popup & nub vertical positioning
        if (this.container.floating){
            if ((this.offset.left + this.offset.width) < innerWidth/2) {
                this.applyPosition({left: this.offset.left + this.offset.width});
                this.container.addRemoveClass('left', true);
            } else {
                this.applyPosition({left: this.offset.left - clientRect.width});
                this.container.addRemoveClass('right', true);
            }
        } else {
            if (this.offset.left - clientRect.width > 0) {
                this.applyPosition({left: this.offset.left - clientRect.left - clientRect.width});
                this.container.addRemoveClass('right', true);
            } else {
                this.applyPosition({left: this.offset.width});
                this.container.addRemoveClass('left', true);
            }
        }
        this.container.addRemoveClass('horizontal', true);

        //if moving the popup left or right of the activator puts it past the edge of the screen then horizontal won't work
        clientRect = this.getBoundingRect(this.container.node);
        if (clientRect.left < 0 || (clientRect.left + clientRect.width) > innerWidth){
            return false;
        }
        return true;

    },

    /**
    * Moves the popup to the left or right of the activating control.
    *
    * @return {Boolean} `false` if popup was not moved because it would not fit onscreen
    * in the new position; otherwise, `true`.
    * @public
    */
    applyHorizontalPositioning: function () {
        //if we can't fit the popup left or right of the activator then forget horizontal positioning
        if (!this.initHorizontalPositioning()) {
            return false;
        }

        var clientRect = this.getBoundingRect(this.container.node);
        var innerHeight = this.getViewHeight();
        var activatorCenter = this.offset.top + this.offset.height/2;

        if (this.container.floating){
            //if the activator's center is within 10% of the center of the view, vertically center the popup
            if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
                this.applyPosition({top: this.offset.top + this.offset.height/2 - clientRect.height/2, bottom: 'auto'});
            } else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
                this.applyPosition({top: this.offset.top, bottom: 'auto'});
                this.container.addRemoveClass('high', true);
            } else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
                this.applyPosition({top: this.offset.top - clientRect.height + this.offset.height*2, bottom: 'auto'});
                this.container.addRemoveClass('low', true);
            }
        } else {
            //if the activator's center is within 10% of the center of the view, vertically center the popup
            if ((activatorCenter >= (innerHeight/2 - 0.05 * innerHeight)) && (activatorCenter <= (innerHeight/2 + 0.05 * innerHeight))) {
                this.applyPosition({top: (this.offset.height - clientRect.height)/2});
            } else if (this.offset.top + this.offset.height < innerHeight/2) { //the activator is in the top 1/2 of the screen
                this.applyPosition({top: -this.offset.height});
                this.container.addRemoveClass('high', true);
            } else { //otherwise the popup will be positioned in the bottom 1/2 of the screen
                this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top + this.offset.height});
                this.container.addRemoveClass('low', true);
            }
        }
        return true;
    },


    /**
    * Positions the popup horizontally flush with the activating control.
    *
    * @param {Number} leftFlushPt - Left side cutoff.
    * @param {Number} rightFlushPt - Right side cutoff.
    * @return {Boolean} `false` if popup will not fit onscreen in new position;
    * otherwise, `true`.
    * @public
    */
    applyHorizontalFlushPositioning: function (leftFlushPt, rightFlushPt) {
        //if we can't fit the popup left or right of the activator then forget horizontal positioning
        if (!this.initHorizontalPositioning()) {
            return false;
        }

        var clientRect = this.getBoundingRect(this.container.node);
        var innerHeight = this.getViewHeight();

        //adjust vertical positioning (high or low nub & popup position)
        if (this.container.floating){
            if (this.offset.top < (innerHeight/2)){
                this.applyPosition({top: this.offset.top + this.offset.height/2});
                this.container.addRemoveClass('high', true);
            } else {
                this.applyPosition({top:this.offset.top + this.offset.height/2 - clientRect.height});
                this.container.addRemoveClass('low', true);
            }
        } else {
            if (((clientRect.top + clientRect.height) > innerHeight) && ((innerHeight - clientRect.bottom) < (clientRect.top - clientRect.height))) {
                this.applyPosition({top: clientRect.top - clientRect.height - this.offset.top - this.offset.height/2});
                this.container.addRemoveClass('low', true);
            } else {
                this.applyPosition({top: this.offset.height/2});
                this.container.addRemoveClass('high', true);
            }
        }

        //If the activator's right side is within our left side cut off use flush positioning
        if ((this.offset.left + this.offset.width) < leftFlushPt){
            this.container.addClass('left');
            this.container.addClass('corner');
            return true;
        }
        //If the activator's left side is within our right side cut off use flush positioning
        else if (this.offset.left > rightFlushPt) {
            this.container.addClass('right');
            this.container.addClass('corner');
            return true;
        }

        return false;
    },

    /**
    * Retrieves an object with properties describing the bounding rectangle for the
    * passed-in DOM node.
    *
    * @param  {String} inNode - DOM node for which to retrieve the bounding rectangle.
    * @return {Object} Object with properties describing the DOM node's bounding rectangle.
    * @private
    */
    getBoundingRect:  function (inNode){
        // getBoundingClientRect returns top/left values which are relative to the viewport and not absolute
        var o = inNode.getBoundingClientRect();
        if (!o.width || !o.height) {
            return {
                left: o.left,
                right: o.right,
                top: o.top,
                bottom: o.bottom,
                width: o.right - o.left,
                height: o.bottom - o.top
            };
        }
        return o;
    },

    /**
    * @private
    */
    getViewHeight: function () {
        return (window.innerHeight === undefined) ? document.documentElement.clientHeight : window.innerHeight;
    },

    /**
    * @private
    */
    getViewWidth: function () {
        return (window.innerWidth === undefined) ? document.documentElement.clientWidth : window.innerWidth;
    },

    /**
    * @private
    */
    applyPosition: function (inRect) {
        var s = '';
        for (var n in inRect) {
            s += (n + ':' + inRect[n] + (isNaN(inRect[n]) ? '; ' : 'px; '));
        }
        this.container.addStyles(s);
    },

    /**
    * @private
    */
    resetPositioning: function () {
        this.container.removeClass('right');
        this.container.removeClass('left');
        this.container.removeClass('high');
        this.container.removeClass('low');
        this.container.removeClass('corner');
        this.container.removeClass('below');
        this.container.removeClass('above');
        this.container.removeClass('vertical');
        this.container.removeClass('horizontal');

        this.applyPosition({left: 'auto'});
        this.applyPosition({top: 'auto'});
    },

    /**
    * @private
    */
    reflow: function () {
        this.offset = this.container.activatorOffset;
        this.adjustPosition();
    }
});

}],'layout/CardArranger':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/CardArranger~CardArranger} kind.
* @module layout/CardArranger
*/

var
	kind = require('enyo/kind');

var
	Arranger = require('./Arranger');


/**
* {@link module:layout/CardArranger~CardArranger} is a {@link module:layout/Arranger~Arranger}
* that displays only one active control. The non-active controls are hidden with
* `setShowing(false)`. Transitions between arrangements are handled by fading
* from one control to the next.
*
* For more information, see the documentation on
* [Arrangers]{@linkplain $dev-guide/building-apps/layout/arrangers.html} in the
* Enyo Developer Guide.
*
* @class CardArranger
* @extends module:layout/Arranger~Arranger
* @public
*/
module.exports = kind(
	/** @lends module:layout/CardArranger~CardArranger.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.CardArranger',

	/**
	* @private
	*/
	kind: Arranger,

	/**
	* @private
	*/
	layoutClass: 'enyo-arranger enyo-arranger-fit',

	/**
	* @see {@link module:layout/Arranger~Arranger#calcArrangementDifference}
	* @protected
	*/
	calcArrangementDifference: function (i0, a0, i1, a1) {
		return this.containerBounds.width;
	},

	/**
	* Applies opacity to the activation and deactivation of panels. Expects the passed-in
	* array of controls to be ordered such that the first control in the array is the active
	* panel.
	*
	* @see {@link module:layout/Arranger~Arranger#arrange}
	* @protected
	*/
	arrange: function (controls, arrangement) {
		for (var i=0, c, v; (c=controls[i]); i++) {
			v = (i === 0) ? 1 : 0;
			this.arrangeControl(c, {opacity: v});
		}
	},

	/**
	* Shows the active panel at the start of transition. Also triggers a resize on
	* the active panel if it wasn't previously showing.
	*
	* @see {@link module:layout/Arranger~Arranger#start}
	* @method
	* @protected
	*/
	start: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				var wasShowing=c.showing;
				c.setShowing(i == this.container.fromIndex || i == (this.container.toIndex));
				if (c.showing && !wasShowing) {
					c.resize();
				}
			}
		};
	}),

	/**
	* Hides all non-active panels when the transition completes.
	*
	* @see {@link module:layout/Arranger~Arranger#finish}
	* @method
	* @protected
	*/
	finish: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				c.setShowing(i == this.container.toIndex);
			}
		};
	}),

	/**
	* Ensures all panels are showing and visible when the arranger is destroyed.
	*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var c$ = this.container.getPanels();
			for (var i=0, c; (c=c$[i]); i++) {
				Arranger.opacifyControl(c, 1);
				if (!c.showing) {
					c.setShowing(true);
				}
			}
			sup.apply(this, arguments);
		};
	})
});

},{'./Arranger':'layout/Arranger'}],'layout/Panels':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/Panels~Panels} kind.
* @module layout/Panels
*/

var
	kind = require('enyo/kind'),
	dispatcher = require('enyo/dispatcher'),
	dom = require('enyo/dom'),
	platform = require('enyo/platform'),
	utils = require('enyo/utils'),
	Animator = require('enyo/Animator');

var
	CardArranger = require('../CardArranger');

/**
* Fires at the start of a panel transition, when [setIndex()]{@link module:layout/Panels~Panels#setIndex}
* is called, and also during dragging.
*
* @event module:layout/Panels~Panels#onTransitionStart
* @type {Object}
* @property {Number} fromIndex - The index of the old panel.
* @property {Number} toIndex   - The index of the new panel.
* @public
*/

/**
* Fires at the end of a panel transition, when [setIndex()]{@link module:layout/Panels~Panels#setIndex}
* is called, and also during dragging.
*
* @event module:layout/Panels~Panels#onTransitionFinish
* @type {Object}
* @property {Number} fromIndex - The index of the old panel.
* @property {Number} toIndex   - The index of the new panel.
* @public
*/

/**
* The {@link module:layout/Panels~Panels} kind is designed to satisfy a variety of common use cases
* for application layout. Using `Panels`, controls may be arranged as (among
* other things) a carousel, a set of collapsing panels, a card stack that fades
* between panels, or a grid.
*
* Any Enyo control may be placed inside a `Panels`, but by convention we
* refer to each of these controls as a "panel". From the set of panels in a
* `Panels`, one is considered to be active. The active panel is set by index
* using the [setIndex()]{@link module:layout/Panels~Panels#setIndex} method. The actual layout of
* the panels typically changes each time the active panel is set, such that the new
* active panel has the most prominent position.
*
* For more information, see the documentation on
* [Panels]{@linkplain $dev-guide/building-apps/layout/panels.html} in the
* Enyo Developer Guide.
*
* @class Panels
* @extends module:enyo/Control~Control
* @ui
* @public
*/
var Panels = module.exports = kind(
	/** @lends module:layout/Panels~Panels.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Panels',

	/**
	* @private
	*/
	classes: 'enyo-panels',

	/**
	* @lends module:layout/Panels~Panels.prototype
	* @private
	*/
	published: {
		/**
		* The index of the active panel. The layout of panels is controlled by the
		* [layoutKind]{@link module:layout/Panels~Panels#layoutKind}, but as a rule, the active panel
		* is displayed in the most prominent position. For example, in the (default)
		* {@link module:layout/CardArranger~CardArranger} layout, the active panel is shown and the other
		* panels are hidden.
		*
		* @type {Number}
		* @default  0
		* @public
		*/
		index: 0,

		/**
		* Indicates whether the user may drag between panels.
		*
		* @type {Boolean}
		* @default  true
		* @public
		*/
		draggable: true,

		/**
		* Indicates whether the panels animate when transitioning, e.g., when
		* [setIndex()]{@link module:layout/Panels~Panels#setIndex} is called.
		*
		* @type {Boolean}
		* @default  true
		* @public
		*/
		animate: true,

		/**
		* Indicates whether panels "wrap around" when moving past the end.
		* The actual effect depends upon the arranger in use.
		*
		* @type {Boolean}
		* @default  false
		* @public
		*/
		wrap: false,

		/**
		* The arranger kind to be used for dynamic layout.
		*
		* @type {String}
		* @default  'CardArranger'
		* @public
		*/
		arrangerKind: CardArranger,

		/**
		* By default, each panel will be sized to fit the Panels' width when the
		* screen size is sufficiently narrow (less than 800px). Set to `false` to
		* avoid this behavior.
		*
		* @type {Boolean}
		* @default  true
		* @public
		*/
		narrowFit: true
	},

	/**
	* @private
	*/
	events: {
		onTransitionStart: '',
		onTransitionFinish: ''
	},

	/**
	* @private
	*/
	handlers: {
		ondragstart: 'dragstart',
		ondrag: 'drag',
		ondragfinish: 'dragfinish',
		onscroll: 'domScroll'
	},

	/**
	* @private
	*/
	tools: [
		{kind: Animator, onStep: 'step', onEnd: 'animationEnded'}
	],

	/**
	* Tracks completion percentage for a transition between two panels.
	*
	* @private
	*/
	fraction: 0,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			this.transitionPoints = [];
			sup.apply(this, arguments);
			this.arrangerKindChanged();
			this.narrowFitChanged();
			this.indexChanged();
		};
	}),

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			dispatcher.makeBubble(this, 'scroll');
		};
	}),

	/**
	* @private
	*/
	domScroll: function (sender, event) {
		if (this.hasNode()) {
			if (this.node.scrollLeft > 0) {
				// Reset scrollLeft position
				this.node.scrollLeft = 0;
			}
		}
	},

	/**
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function () {
			this.createChrome(this.tools);
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	arrangerKindChanged: function () {
		this.setLayoutKind(this.arrangerKind);
	},

	/**
	* @private
	*/
	narrowFitChanged: function () {
		this.addRemoveClass(Panels.getNarrowClass(), this.narrowFit);
	},

	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			// When the entire panels is going away, take note so we don't try and do single-panel
			// remove logic such as changing the index and reflowing when each panel is destroyed
			this.destroying = true;
			sup.apply(this, arguments);
		};
	}),

	/**
	* Adjusts the index if the removed control is the active panel and reflows the layout.
	*
	* @method
	* @private
	*/
	removeControl: kind.inherit(function (sup) {
		return function (control) {
			// Skip extra work during panel destruction.
			if (this.destroying) {
				return sup.apply(this, arguments);
			}
			// adjust index if the current panel is being removed
			// so it's either the previous panel or the first one.
			var newIndex = -1;
			var controlIndex = utils.indexOf(control, this.controls);
			if (controlIndex === this.index) {
				newIndex = Math.max(controlIndex - 1, 0);
			}
			sup.apply(this, arguments);
			if (newIndex !== -1 && this.controls.length > 0) {
				this.setIndex(newIndex);
				this.flow();
				this.reflow();
			}
		};
	}),

	/**
	* Designed to be overridden in kinds derived from Panels that have
	* non-panel client controls.
	*
	* @return {Boolean} [description]
	* @protected
	* @todo  Assume that this should take a control as a parameter.
	*/
	isPanel: function () {
		return true;
	},

	/**
	* @method
	* @private
	*/
	flow: kind.inherit(function (sup) {
		return function () {
			this.arrangements = [];
			sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	reflow: kind.inherit(function (sup) {
		return function () {
			this.arrangements = [];
			sup.apply(this, arguments);
			this.refresh();
		};
	}),

	/**
	* Returns the array of contained panels. Subclasses may override this if they
	* don't want the arranger to lay out all of their children.
	*
	* @return {module:enyo/Control~Control[]} - The array of contained panels.
	*/
	getPanels: function () {
		var p = this.controlParent || this;
		return p.children;
	},

	/**
	* Returns a reference to the active panel--i.e., the panel at the specified index.
	*
	* @return {module:enyo/Control~Control} - The active panel.
	*/
	getActive: function () {
		var p$ = this.getPanels();
		//Constrain the index within the array of panels, needed if wrapping is enabled
		var index = this.index % p$.length;
		if (index < 0) {
			index += p$.length;
		}
		return p$[index];
	},

	/**
	* Returns a reference to the {@link module:enyo/Animator~Animator} instance used to
	* animate panel transitions. The Panels' animator may be used to set the
	* duration of panel transitions, e.g.:
	*
	* ```
	* this.getAnimator().setDuration(1000);
	* ```
	*
	* @return {module:enyo/Animator~Animator} - The {@link module:enyo/Animator~Animator} instance used to animate
	* panel transitions.
	* @public
	*/
	getAnimator: function () {
		return this.$.animator;
	},

	/**
	* Sets the active panel to the panel specified by the given index.
	* Note that if the [animate]{@link module:layout/Panels~Panels#animate} property is set to
	* `true`, the active panel will animate into view.
	*
	* @param {Number} index - The index of the panel to activate.
	* @public
	*/
	setIndex: function (index) {
		// override setIndex so that indexChanged is called
		// whether this.index has actually changed or not. Also, do
		// index clamping here.
		var prevIndex = this.get('index'),
			newIndex = this.clamp(index);
		this.index = newIndex;
		this.notifyObservers('index', prevIndex, newIndex);
	},

	/**
	* Sets the active panel to the panel specified by the given index.
	* The transition to the next panel will be immediate and will not be animated,
	* regardless of the value of the [animate]{@link module:layout/Panels~Panels#animate} property.
	*
	* @param {Number} index - The index of the panel to activate.
	* @public
	*/
	setIndexDirect: function (index) {
		if (this.animate) {
			this.animate = false;
			this.setIndex(index);
			this.animate = true;
		} else {
			this.setIndex(index);
		}
	},

	/**
	* Selects the named component owned by the Panels and returns its index.
	*
	* @param  {String} name - The name of the panel to activate.
	* @return {Number} The index of the newly activated panel.
	* @public
	*/
	selectPanelByName: function (name) {
		if (!name) {
			return;
		}
		var idx = 0;
		var panels = this.getPanels();
		var len = panels.length;
		for (; idx < len; ++idx) {
			if (name === panels[idx].name) {
				this.setIndex(idx);
				return idx;
			}
		}
	},

	/**
	* Transitions to the previous panel--i.e., the panel whose index value is one
	* less than that of the current active panel.
	*
	* @public
	*/
	previous: function () {
		var prevIndex = this.index - 1;
		if (this.wrap && prevIndex < 0) {
			prevIndex = this.getPanels().length - 1;
		}
		this.setIndex(prevIndex);
	},

	/**
	* Transitions to the next panel--i.e., the panel whose index value is one
	* greater than that of the current active panel.
	*
	* @public
	*/
	next: function () {
		var nextIndex = this.index+1;
		if (this.wrap && nextIndex >= this.getPanels().length) {
			nextIndex = 0;
		}
		this.setIndex(nextIndex);
	},

	/**
	* Ensures that `value` references a valid panel, accounting for
	* [wrapping]{@link module:layout/Panels~Panels#wrap}.
	*
	* @param  {Number} value - The index of a panel.
	* @return {Number}       - The valid index of a panel.
	* @private
	*/
	clamp: function (value) {
		var l = this.getPanels().length;
		if (this.wrap) {
			// FIXME: dragging makes assumptions about direction and from->start indexes.
			//return value < 0 ? l : (value > l ? 0 : value);
			value %= l;
			return (value < 0) ? value + l : value;
		} else {
			return Math.max(0, Math.min(value, l - 1));
		}
	},

	/**
	* @private
	*/
	indexChanged: function (old) {
		this.lastIndex = old;
		if (!this.dragging && this.$.animator && this.hasNode()) {
			if (this.shouldAnimate()) {
				// If we're mid-transition, complete it and indicate we need to transition
				if (this.$.animator.isAnimating()) {
					this.transitionOnComplete = true;
					this.$.animator.complete();
				} else {
					this.animateTransition();
				}
			} else {
				this.directTransition();
			}
		}
	},

	/**
	* Returns `true` if the panels should animate in the transition from `fromIndex` to
	* `toIndex`. This can be overridden in a {@glossary subkind} for greater customization.
	*
	* @protected
	*/
	shouldAnimate: function () {
		return this.animate;
	},

	/**
	* @private
	*/
	step: function (sender) {
		this.fraction = sender.value;
		this.stepTransition();
		return true;
	},

	/**
	* @private
	*/
	animationEnded: function (sender, event) {
		this.completed();
		return true;
	},

	/**
	* @private
	*/
	completed: function () {
		this.finishTransition();

		// Animator.onEnd fires asynchronously so we need an internal flag to indicate we need
		// to start the next transition when the previous completes
		if (this.transitionOnComplete) {
			this.transitionOnComplete = false;
			this.animateTransition();
		}

		return true;
	},

	/**
	* @private
	*/
	dragstart: function (sender, event) {
		if (this.draggable && this.layout && this.layout.canDragEvent(event)) {
			event.preventDefault();
			this.dragstartTransition(event);
			this.dragging = true;
			this.$.animator.stop();
			return true;
		}
	},

	/**
	* @private
	*/
	drag: function (sender, event) {
		if (this.dragging) {
			event.preventDefault();
			this.dragTransition(event);
			return true;
		}
	},

	/**
	* @private
	*/
	dragfinish: function (sender, event) {
		if (this.dragging) {
			this.dragging = false;
			event.preventTap();
			this.dragfinishTransition(event);
			return true;
		}
	},

	/**
	* @private
	*/
	dragstartTransition: function (event) {
		if (!this.$.animator.isAnimating()) {
			var f = this.fromIndex = this.index;
			this.toIndex = f - (this.layout ? this.layout.calcDragDirection(event) : 0);
		} else {
			this.verifyDragTransition(event);
		}
		this.fromIndex = this.clamp(this.fromIndex);
		this.toIndex = this.clamp(this.toIndex);
		//this.log(this.fromIndex, this.toIndex);
		this.fireTransitionStart();
		if (this.layout) {
			this.layout.start();
		}
	},

	/**
	* @private
	*/
	dragTransition: function (event) {
		// note: for simplicity we choose to calculate the distance directly between
		// the first and last transition point.
		var d = this.layout ? this.layout.calcDrag(event) : 0;
		var t$ = this.transitionPoints, s = t$[0], f = t$[t$.length-1];
		var as = this.fetchArrangement(s);
		var af = this.fetchArrangement(f);
		var dx = this.layout ? this.layout.drag(d, s, as, f, af) : 0;
		var dragFail = d && !dx;
		if (dragFail) {
			//this.log(dx, s, as, f, af);
		}
		this.fraction += dx;
		var fr = this.fraction;
		if (fr > 1 || fr < 0 || dragFail) {
			if (fr > 0 || dragFail) {
				this.dragfinishTransition(event);
			}
			this.dragstartTransition(event);
			this.fraction = 0;
			// FIXME: account for lost fraction
			//this.dragTransition(event);
		}
		this.stepTransition();
	},

	/**
	* @private
	*/
	dragfinishTransition: function (event) {
		this.verifyDragTransition(event);
		this.setIndex(this.toIndex);
		// note: if we're still dragging, then we're at a transition boundary
		// and should fire the finish event
		if (this.dragging) {
			this.fireTransitionFinish();
		}
	},

	/**
	* @private
	*/
	verifyDragTransition: function (event) {
		var d = this.layout ? this.layout.calcDragDirection(event) : 0;
		var f = Math.min(this.fromIndex, this.toIndex);
		var t = Math.max(this.fromIndex, this.toIndex);
		if (d > 0) {
			var s = f;
			f = t;
			t = s;
		}
		if (f != this.fromIndex) {
			this.fraction = 1 - this.fraction;
		}
		//this.log('old', this.fromIndex, this.toIndex, 'new', f, t);
		this.fromIndex = f;
		this.toIndex = t;
	},

	/**
	* Resets the panels without sending any events.
	*
	* @private
	*/
	refresh: function () {
		if (this.$.animator && this.$.animator.isAnimating()) {
			this.$.animator.stop();
		}
		this.setupTransition();
		this.fraction = 1;
		this.stepTransition();
		this.transitioning = false;
		this.completeTransition();
		this.dragging = false;
	},

	/**
	* Transitions to the new index without animation
	*
	* @private
	*/
	directTransition: function () {
		this.startTransition();
		this.fraction = 1;
		this.stepTransition();
		this.finishTransition();
	},

	/**
	* Animates the transition to the new index
	*
	* @private
	*/
	animateTransition: function () {
		this.startTransition();
		this.$.animator.play({
			startValue: this.fraction
		});
	},

	/**
	* Starts the transition between two panels. if a transition is already in progress, this is
	* a no-op.
	*
	* @private
	*/
	startTransition: function () {
		if (!this.transitioning) {
			this.transitioning = true;
			this.setupTransition();
			this.fireTransitionStart();
		}
	},

	/**
	* Sets up transition state
	*
	* @private
	*/
	setupTransition: function () {
		this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0;
		this.toIndex = this.toIndex != null ? this.toIndex : this.index;
		if (this.layout) {
			this.layout.start();
		}
	},

	/**
	* Completes the transition between two panels.
	*
	* @private
	*/
	finishTransition: function () {
		this.transitioning = false;
		this.completeTransition(true);
	},

	/**
	* Completes the transition by performing any tasks to be run when the transition ends,
	* including firing events and clean-up.
	*
	* @param {Boolean} [fire] - If `true`, will fire the {@link module:layout/Panels~Panels#onTransitionFinish}
	*	event if deemed necessary.
	* @private
	*/
	completeTransition: function (fire) {
		if (this.layout) {
			this.layout.finish();
		}

		if (fire) {
			this.fireTransitionFinish(true);
		} else {
			this.clearTransitionData();
		}
	},

	/**
	* Clears transition-related data.
	*
	* @private
	*/
	clearTransitionData: function() {
		this.transitionPoints = [];
		this.fraction = 0;
		this.fromIndex = this.toIndex = null;
	},

	/**
	* @fires module:layout/Panels~Panels#onTransitionStart
	* @private
	*/
	fireTransitionStart: function () {
		var t = this.startTransitionInfo;
		if (this.hasNode() && (!t || (t.fromIndex != this.fromIndex || t.toIndex != this.toIndex))) {
			this.startTransitionInfo = {fromIndex: this.fromIndex, toIndex: this.toIndex};
			this.doTransitionStart(utils.clone(this.startTransitionInfo));
		}
	},

	/**
	* @fires module:layout/Panels~Panels#onTransitionFinish
	* @param {Boolean} [clearData] - If `true`, {@link module:layout/Panels~Panels#clearTransitionData} will be
	*	called after recording the values needed for the callback.
	* @private
	*/
	fireTransitionFinish: function (clearData) {
		var t = this.finishTransitionInfo,
			fromIndex = t ? t.fromIndex : null,
			toIndex = t ? t.toIndex : null;
		if (this.hasNode() && (!t || (fromIndex != this.fromIndex || toIndex != this.toIndex))) {
				if (this.transitionOnComplete) {
				this.finishTransitionInfo = {fromIndex: toIndex, toIndex: this.lastIndex};
				} else {
					this.finishTransitionInfo = {fromIndex: this.lastIndex, toIndex: this.index};
				}
			if (clearData) {
				this.clearTransitionData();
			}
				this.doTransitionFinish(utils.clone(this.finishTransitionInfo));
		} else if (clearData) {
			this.clearTransitionData();
		}
	},

	/**
	* Interpolates between arrangements as needed.
	*
	* @private
	*/
	stepTransition: function () {
		if (this.hasNode()) {
			// select correct transition points and normalize fraction.
			var t$ = this.transitionPoints;
			var r = (this.fraction || 0) * (t$.length-1);
			var i = Math.floor(r);
			r = r - i;
			var s = t$[i], f = t$[i+1];
			// get arrangements and lerp between them
			var s0 = this.fetchArrangement(s);
			var s1 = this.fetchArrangement(f);
			this.arrangement = s0 && s1 ? Panels.lerp(s0, s1, r) : (s0 || s1);
			if (this.arrangement && this.layout) {
				this.layout.flowArrangement();
			}
		}
	},

	/**
	* Fetches the arrangement at a specified index, initializing it if necessary.
	*
	* @param  {Number} index - The index of the desired arrangement from `transitionPoints`.
	* @return {Object} The desired arrangement object.
	* @private
	*/
	fetchArrangement: function (index) {
		if ((index != null) && !this.arrangements[index] && this.layout) {
			this.layout._arrange(index);
			this.arrangements[index] = this.readArrangement(this.getPanels());
		}
		return this.arrangements[index];
	},

	/**
	* Iterates over `panels` and retrieves a copy of each panel's `_arranger`.
	*
	* @param  {module:enyo/Control~Control[]} panels - The array of panels.
	* @return {Object[]}              - The array of arrangement objects.
	*/
	readArrangement: function (panels) {
		var r = [];
		for (var i=0, c$=panels, c; (c=c$[i]); i++) {
			r.push(utils.clone(c._arranger));
		}
		return r;
	},

	/**
	* @lends module:layout/Panels~Panels
	* @private
	*/
	statics: {
		/**
		* Returns `true` for iOS and Android phone form factors, or when window width
		* is 800px or less. Approximates work done using media queries in `Panels.css`.
		*
		* @return {Boolean} `true` for narrow devices or viewports; otherwise, `false`.
		* @public
		*/
		isScreenNarrow: function () {
			if(Panels.isNarrowDevice()) {
				return true;
			} else {
				return dom.getWindowWidth() <= 800;
			}
		},

		/**
		* Returns the class name to apply for narrow fitting. See media queries
		* in `Panels.css`.
		*
		* @return {String} The CSS class name to apply.
		*/
		getNarrowClass: function () {
			if(Panels.isNarrowDevice()) {
				return 'enyo-panels-force-narrow';
			} else {
				return 'enyo-panels-fit-narrow';
			}
		},

		/**
		* Lerps between arrangements.
		*
		* @param  {Object[]} a0     - Array of current arrangement objects.
		* @param  {Object[]} a1     - Array of target arrangement object.
		* @param  {Number} fraction - The fraction (between 0 and 1) with which to lerp.
		* @return {Object[]}        - Array of arrangements that is `fraction` between
		* 	`a0` and `a1`.
		* @private
		*/
		lerp: function (a0, a1, fraction) {
			var r = [];
			for (var i=0, k$=utils.keys(a0), k; (k=k$[i]); i++) {
				r.push(this.lerpObject(a0[k], a1[k], fraction));
			}
			return r;
		},

		/**
		* Lerps between the values of arrangement objects.
		*
		* @param  {Object} a0       - The source arragement.
		* @param  {Object} a1       - The destination arragement.
		* @param  {Number} fraction - The fraction (between 0 and 1) with which to lerp.
		*
		* @return {Object}          - The lerped arrangement.
		* @private
		*/
		lerpObject: function (a0, a1, fraction) {
			var b = utils.clone(a0), n, o;
			// a1 might be undefined when deleting panels
			if (a1) {
				for (var i in a0) {
					n = a0[i];
					o = a1[i];
					if (n != o) {
						b[i] = n - (n - o) * fraction;
					}
				}
			}
			return b;
		},

		/**
		* Tests User Agent strings to identify narrow devices.
		*
		* @return {Boolean} `true` if the current device is a narrow device;
		* otherwise, `false`.
		*/
		isNarrowDevice: function () {
			var ua = navigator.userAgent;
			switch (platform.platformName) {
				case 'ios':
					return (/iP(?:hone|od;(?: U;)? CPU) OS (\d+)/).test(ua);
				case 'android':
					return (/Mobile/).test(ua) && (platform.android > 2);
				case 'androidChrome':
					return (/Mobile/).test(ua);
			}
			return false;
		}
	}
});

},{'../CardArranger':'layout/CardArranger'}],'layout/FittableLayout':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/FittableLayout~FittableLayout}, {@link module:layout/FittableLayout~FittableColumnsLayout}
* and {@link module:layout/FittableLayout~FittableRowsLayout} kinds.
* @module layout/FittableLayout
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	Control = require('enyo/Control'),
	Layout = require('enyo/Layout');

var detector = document.createElement('div'),
	flexAvailable =
		(detector.style.flexBasis !== undefined) ||
		(detector.style.webkitFlexBasis !== undefined) ||
		(detector.style.mozFlexBasis !== undefined) ||
		(detector.style.msFlexBasis !== undefined);

/**
* {@link module:layout/FittableLayout~FittableLayout} provides the base
* positioning and boundary logic for the fittable layout strategy. The fittable
* layout strategy is based on laying out items in either a set of rows or a set
* of columns, with most of the items having natural size, but one item expanding
* to fill the remaining space. The item that expands is labeled with the
* attribute `fit: true`.
*
* The subkinds {@link module:layout/FittableLayout~FittableColumnsLayout} and
* {@link module:layout/FittableLayout~FittableRowsLayout} (or _their_ subkinds)
* are used for layout rather than `FittableLayout` because they specify
* properties that the framework expects to be available when laying items out.
*
* When available on the platform, you can opt-in to have `FittableLayout` use
* CSS flexible box (flexbox) to implement fitting behavior on the platform for
* better performance; Enyo will fall back to JavaScript-based layout on older
* platforms. Three subtle differences between the flexbox and JavaScript
* implementations should be noted:

* - When using flexbox, vertical margins (i.e., `margin-top`, `margin-bottom`) will
* not collapse; when using JavaScript layout, vertical margins will collapse according
* to static layout rules.
*
* - When using flexbox, non-fitting children of the Fittable must not be sized
* using percentages of the container (even if set to `position: relative`);
* this is explicitly not supported by the flexbox 2013 spec.
*
* - The flexbox-based Fittable implementation will respect multiple children
* with `fit: true` (the fitting space will be divided equally between them).
* This is NOT supported by the JavaScript implementation, and you should not rely
* upon this behavior if you are deploying to platforms without flexbox support.
*
* The flexbox implementation was added to Enyo 2.5.0 as an optional performance
* optimization; to use the optimization, set `useFlex: true` on the Fittable
* container.  This will cause flexbox to be used when possible.
*
* @class FittableLayout
* @extends module:enyo/Layout~Layout
* @public
*/
var FittableLayout = module.exports = kind(/** @lends module:layout/FittableLayout~FittableLayout.prototype */{
	name: 'enyo.FittableLayout',

	/**
	* @private
	*/
	kind: Layout,

	/**
	* @private
	*/
	noDefer: true,

	/**
	* @method
	* @private
	*/
	constructor: function () {
		Layout.prototype._constructor.apply(this, arguments);

		// Add the force-ltr class if we're in RTL mode, but this control is set explicitly to NOT be in RTL mode.
		this.container.addRemoveClass('force-left-to-right', (Control.prototype.rtl && !this.container.get('rtl')) );

		// Flexbox optimization is determined by global flexAvailable and per-instance opt-in useFlex flag
		this.useFlex = flexAvailable && (this.container.useFlex === true);
		if (this.useFlex) {
			this.container.addClass(this.flexLayoutClass);
		} else {
			this.container.addClass(this.fitLayoutClass);
		}
	},

	/**
	* @private
	*/
	calcFitIndex: function () {
		var aChildren = this.container.children,
			oChild,
			n;

		for (n=0; n<aChildren.length; n++) {
			oChild = aChildren[n];
			if (oChild.fit && oChild.showing) {
				return n;
			}
		}
	},

	/**
	* @private
	*/
	getFitControl: function () {
		var aChildren = this.container.children,
			oFitChild = aChildren[this.fitIndex];

		if (!(oFitChild && oFitChild.fit && oFitChild.showing)) {
			this.fitIndex = this.calcFitIndex();
			oFitChild = aChildren[this.fitIndex];
		}
		return oFitChild;
	},

	/**
	* @private
	*/
	shouldReverse: function () {
		return this.container.rtl && this.orient === 'h';
	},
	
	/**
	* @private
	*/
	destroy: function () {
		Layout.prototype.destroy.apply(this, arguments);
		
		if (this.container) {
			this.container.removeClass(this.useFlex ? this.flexLayoutClass : this.fitLayoutClass);
		}
	},

	/**
	* @private
	*/
	getFirstChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[aChildren.length - 1];
		} else {
			return aChildren[0];
		}
	},

	/**
	* @private
	*/
	getLastChild: function() {
		var aChildren = this.getShowingChildren();

		if (this.shouldReverse()) {
			return aChildren[0];
		} else {
			return aChildren[aChildren.length - 1];
		}
	},

	/**
	* @private
	*/
	getShowingChildren: function() {
		var a = [],
			n = 0,
			aChildren = this.container.children,
			nLength   = aChildren.length;

		for (;n<nLength; n++) {
			if (aChildren[n].showing) {
				a.push(aChildren[n]);
			}
		}

		return a;
	},

	/**
	* @private
	*/
	_reflow: function(sMeasureName, sClienMeasure, sAttrBefore, sAttrAfter) {
		this.container.addRemoveClass('enyo-stretch', !this.container.noStretch);
		
		var oFitChild       = this.getFitControl(),
			oContainerNode  = this.container.hasNode(),  // Container node
			nTotalSize     = 0,                          // Total container width or height without padding
			nBeforeOffset   = 0,                         // Offset before fit child
			nAfterOffset    = 0,                         // Offset after fit child
			oPadding,                                    // Object containing t,b,r,l paddings
			oBounds,                                     // Bounds object of fit control
			oLastChild,
			oFirstChild,
			nFitSize;

		if (!oFitChild || !oContainerNode) { return true; }

		oPadding   = dom.calcPaddingExtents(oContainerNode);
		oBounds    = oFitChild.getBounds();
		nTotalSize = oContainerNode[sClienMeasure] - (oPadding[sAttrBefore] + oPadding[sAttrAfter]);

		// If total size is zero, there's nothing for us to do (and the Control
		// we're doing layout for is probably hidden). In this case, we
		// short-circuit and return `true` to signify that we want to reflow
		// again the next time the Control is shown.
		if (nTotalSize === 0) {
			return true;
		}

		if (this.shouldReverse()) {
			oFirstChild  = this.getFirstChild();
			nAfterOffset = nTotalSize - (oBounds[sAttrBefore] + oBounds[sMeasureName]);

			var nMarginBeforeFirstChild = dom.getComputedBoxValue(oFirstChild.hasNode(), 'margin', sAttrBefore) || 0;

			if (oFirstChild == oFitChild) {
				nBeforeOffset = nMarginBeforeFirstChild;
			} else {
				var oFirstChildBounds      = oFirstChild.getBounds(),
					nSpaceBeforeFirstChild = oFirstChildBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

				nBeforeOffset = oBounds[sAttrBefore] + nMarginBeforeFirstChild - nSpaceBeforeFirstChild;
			}
		} else {
			oLastChild    = this.getLastChild();
			nBeforeOffset = oBounds[sAttrBefore] - (oPadding[sAttrBefore] || 0);

			var nMarginAfterLastChild = dom.getComputedBoxValue(oLastChild.hasNode(), 'margin', sAttrAfter) || 0;

			if (oLastChild == oFitChild) {
				nAfterOffset = nMarginAfterLastChild;
			} else {
				var oLastChildBounds = oLastChild.getBounds(),
					nFitChildEnd     = oBounds[sAttrBefore] + oBounds[sMeasureName],
					nLastChildEnd    = oLastChildBounds[sAttrBefore] + oLastChildBounds[sMeasureName] +  nMarginAfterLastChild;

				nAfterOffset = nLastChildEnd - nFitChildEnd;
			}
		}

		nFitSize = nTotalSize - (nBeforeOffset + nAfterOffset);
		oFitChild.applyStyle(sMeasureName, nFitSize + 'px');
	},

	/**
	* Assigns any static layout properties not dependent on changes to the
	* rendered component or container sizes, etc.
	* 
	* @public
	*/
	flow: function() {
		if (this.useFlex) {
			var i,
				children = this.container.children,
				child;
			this.container.addClass(this.flexLayoutClass);
			this.container.addRemoveClass('nostretch', this.container.noStretch);
			for (i=0; i<children.length; i++) {
				child = children[i];
				child.addClass('enyo-flex-item');
				child.addRemoveClass('flex', child.fit);
			}
		}
	},

	/**
	* Updates the layout to reflect any changes made to the layout container or
	* the contained components.
	*
	* @public
	*/
	reflow: function() {
		if (!this.useFlex) {
			if (this.orient == 'h') {
				return this._reflow('width', 'clientWidth', 'left', 'right');
			} else {
				return this._reflow('height', 'clientHeight', 'top', 'bottom');
			}
		}
	},

	/**
	* @private
	* @lends module:layout/FittableLayout~FittableLayout.prototype
	*/
	statics: {
		/**
		* Indicates whether flexbox optimization can be used.
		*
		* @type {Boolean}
		* @default  false
		* @private
		*/
		flexAvailable: flexAvailable
	}
});

/**
* {@link module:layout/FittableLayout~FittableColumnsLayout} provides a
* container in which items are laid out in a set of vertical columns, with most
* of the items having natural size, but one expanding to fill the remaining
* space. The one that expands is labeled with the attribute `fit: true`.
*
* `FittableColumnsLayout` is meant to be used as a value for the `layoutKind`
* property of other kinds. `layoutKind` provides a way to add layout behavior in
* a pluggable fashion while retaining the ability to use a specific base kind.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableColumnsLayout
* @extends module:layout/FittableLayout~FittableLayout
* @public
*/

/**
* The declaration for {@link module:layout/FittableLayout~FittableColumnsLayout}
*/
module.exports.Columns = kind(/** @lends module:layout/FittableLayout~FittableColumnsLayout.prototype */{
	name        : 'enyo.FittableColumnsLayout',
	kind        : FittableLayout,
	orient      : 'h',
	fitLayoutClass : 'enyo-fittable-columns-layout',
	flexLayoutClass: 'enyo-flex-container columns'
});


/**
* {@link module:layout/FittableLayout~FittableRowsLayout} provides a container
* in which items are laid out in a set of horizontal rows, with most of the
* items having natural size, but one expanding to fill the remaining space. The
* one that expands is labeled with the attribute `fit: true`.
*
* `FittableRowsLayout` is meant to be used as a value for the `layoutKind`
* property of other kinds. `layoutKind` provides a way to add layout behavior in
* a pluggable fashion while retaining the ability to use a specific base kind.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableRowsLayout
* @extends module:layout/FittableLayout~FittableLayout
* @public
*/

/**
* The declaration for {@link module:layout/FittableLayout~FittableRowsLayout}
*/
module.exports.Rows = kind(
	/** @lends module:layout/FittableLayout~FittableRowsLayout.prototype */ {

	/**
	* @private
	*/
	name        : 'enyo.FittableRowsLayout',

	/**
	* @private
	*/
	kind        : FittableLayout,

	/**
	* Layout CSS class used to fit rows.
	*
	* @type {String}
	* @default 'enyo-fittable-rows-layout'
	* @public
	*/
	fitLayoutClass : 'enyo-fittable-rows-layout',

	/**
	* The orientation of the layout.
	*
	* @type {String}
	* @default 'v'
	* @public
	*/
	orient      : 'v',

	/**
	* @private
	*/
	flexLayoutClass: 'enyo-flex-container rows'
});

}],'layout/GridListImageItem':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/GridListImageItem~GridListImageItem} kind.
* @module layout/GridListImageItem
*/

var
	kind = require('enyo/kind'),
	Control = require('enyo/Control'),
	Img = require('enyo/Image'),
	EmptyBinding = require('enyo/EmptyBinding');

/**
* {@link module:layout/GridListImageItem~GridListImageItem} is a convenience component that may be used inside
* an {@link module:enyo/DataGridList~DataGridList} to display an image grid with an optional caption and
* subcaption.
*
* @class GridListImageItem
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/GridListImageItem~GridListImageItem.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.GridListImageItem',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'enyo-gridlist-imageitem',

	/**
	* @private
	*/
	components: [
		{name: 'image', kind: Img, classes:'image'},
		{name: 'caption', kind: Control, classes: 'caption'},
		{name: 'subCaption', kind: Control, classes: 'sub-caption'}
	],

	/**
	* @lends module:layout/GridListImageItem~GridListImageItem.prototype
	* @private
	*/
	published: {
		/**
		* The absolute URL path to the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		source: '',

		/**
		* The primary caption to be displayed with the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		caption: '',

		/**
		* The second caption line to be displayed with the image.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		subCaption: '',

		/**
		* Set to `true` to add the `selected` CSS class to the image tile; set to
		* `false` to remove the `selected` class.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		selected: false,

		/**
		* When `true`, the caption and subcaption are centered; otherwise, they are
		* left-aligned.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		centered: true,

		/**
		* By default, the width of the image fits the width of the item, and the
		* height is sized naturally, based on the image's aspect ratio. Set this
		* property to `'contain'` to letterbox the image in the available space,
		* or `'cover'` to cover the available space with the image (cropping the
		* larger dimension). Note that when `imageSizing` is explicitly specified,
		* you must indicate whether the caption and subcaption are used (by setting
		* the [useCaption]{@link module:layout/GridListImageItem~GridListImageItem#useCaption} and
		* [useSubCaption]{@link module:layout/GridListImageItem~GridListImageItem#useSubCaption} flags) to
		* ensure proper sizing.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		imageSizing: '',

		/**
		* When an [imageSizing]{@link module:layout/GridListImageItem~GridListImageItem#imageSizing} option is
		* explicitly specified, set this to `false` if the caption space should not
		* be reserved. This property has no effect when `imageSizing` retains its
		* default value.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		useCaption: true,

		/**
		* When an [imageSizing]{@link module:layout/GridListImageItem~GridListImageItem#imageSizing} option is
		* explicitly specified, set this to `false` if the subcaption space should
		* not be reserved. This property has no effect when `imageSizing` retains
		* its default value.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		useSubCaption: true,

		/**
		* Placeholder image used while [source]{@link module:layout/GridListImageItem~GridListImageItem#source} is loaded
		*
		* @see module:enyo/Image~Image#placeholder
		* @type {String}
		* @default ''
		* @public
		*/
		placeholder: ''
	},

	/**
	* @private
	*/
	bindings: [
		{from: 'source', to: '$.image.src'},
		{from: 'caption', to: '$.caption.content'},
		{from: 'caption', to: '$.caption.showing', kind: EmptyBinding},
		{from: 'subCaption', to: '$.subCaption.content'},
		{from: 'subCaption', to: '$.subCaption.showing', kind: EmptyBinding},
		{from: 'placeholder', to: '$.image.placeholder'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.selectedChanged();
		this.imageSizingChanged();
		this.centeredChanged();
	},

	/**
	* @private
	*/
	selectedChanged: function () {
		this.addRemoveClass('selected', this.selected);
	},

	/**
	* @private
	*/
	disabledChanged: function () {
		this.addRemoveClass('disabled', this.disabled);
	},

	/**
	* @private
	*/
	imageSizingChanged: function () {
		this.$.image.setSizing(this.imageSizing);
		this.addRemoveClass('sized-image', !!this.imageSizing);
		if (this.imageSizing) {
			this.useCaptionChanged();
			this.useSubCaptionChanged();
		}
	},

	/**
	* @private
	*/
	useCaptionChanged: function () {
		this.addRemoveClass('use-caption', this.useCaption);
	},

	/**
	* @private
	*/
	useSubCaptionChanged: function () {
		this.addRemoveClass('use-subcaption', this.useSubCaption);
	},

	/**
	* @private
	*/
	centeredChanged: function () {
		this.addRemoveClass('centered', this.centered);
	}
});

}],'layout/FittableRows':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/FittableRows~FittableRows} kind.
* @module layout/FittableRows
*/

var
	kind = require('enyo/kind')	;

var
	FittableLayout = require('./FittableLayout'),
	FittableRowsLayout = FittableLayout.Rows;

/**
* {@link module:layout/FittableRows~FittableRows} provides a container in which items are laid out in a
* set	of horizontal rows, with most of the items having natural size, but one
* expanding to fill the remaining space. The one that expands is labeled with
* the attribute `fit: true`.
*
* For more information, see the documentation on
* [Fittables]{@linkplain $dev-guide/building-apps/layout/fittables.html} in the
* Enyo Developer Guide.
*
* @class FittableRows
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(/** @lends module:layout/FittableRows~FittableRows.prototype */{

	/**
	* @private
	*/
	name: 'enyo.FittableRows',

	/**
	* A {@glossary kind} used to manage the size and placement of child
	* [components]{@link module:enyo/Component~Component}.
	*
	* @type {String}
	* @default ''
	* @private
	*/
	layoutKind: FittableRowsLayout,

	/**
	* By default, items in columns stretch to fit horizontally; set to `true` to
	* avoid this behavior.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	noStretch: false
});

},{'./FittableLayout':'layout/FittableLayout'}],'layout/PanZoomView':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/PanZoomView~PanZoomView} kind.
* @module layout/PanZoomView
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	utils = require('enyo/utils'),
	Animator = require('enyo/Animator'),
	Scroller = require('enyo/Scroller');

/**
* Fires whenever the user adjusts the zoom via double-tap/double-click, mousewheel,
* or pinch-zoom.
*
* @event module:layout/PanZoomView~PanZoomView#onZoom
* @type {Object}
* @property {Number} scale - The new scaling factor.
* @public
*/

/**
* Fires after a zoom to notify children to position non-zooming controls.
*
* @event module:layout/PanZoomView~PanZoomView#onPositionPin
* @type {Object}
* @property {Numer} scale   - The new scaling factor.
* @property {Object} bounds - An object containing the current viewport bounds.
* @public
*/

/**
* {@link module:layout/PanZoomView~PanZoomView} is a control that displays arbitrary content at a given
* scaling factor, with enhanced support for double-tap/double-click to zoom,
* panning, mousewheel zooming and pinch-zoom (on touchscreen devices that
* support it).
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		PanZoomView = require('layout/PanZoomView');
*
* 	{kind: PanZoomView, scale: 'auto', contentWidth: 500, contentHeight: 500,
* 		style: 'width: 500px; height: 400px;',
* 		components: [{content: 'Hello World'}]
* 	}
* ```
*
* An [onZoom]{@link module:layout/PanZoomView~PanZoomView#onZoom} event is triggered when the
* user changes the zoom level.
*
* If you wish, you may add {@link module:enyo/ScrollThumb~ScrollThumb} indicators, disable zoom
* animation, allow panning overscroll (with a bounce-back effect), and control
* the propagation of drag events, all via Boolean properties.
*
* For the PanZoomView to work, you must either specify the width and height of
* the scaled content (via the `contentWidth` and `contentHeight` properties) or
* bubble an `onSetDimensions` event from one of the underlying components.
*
* Note that it's best to specify a size for the PanZoomView in order to avoid
* complications.
*
* @class PanZoomView
* @extends module:enyo/Scroller~Scroller
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/PanZoomView~PanZoomView.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.PanZoomView',

	/**
	* @private
	*/
	kind: Scroller,

	/**
	* If `true`, allows overscrolling during panning, with a bounce-back effect.
	*
	* @type {Boolean}
	* @default false
	* @see {@link module:enyo/Scroller~Scroller#touchOverscroll}
	* @public
	*/
	touchOverscroll: false,

	/**
	* If `true`, a ScrollThumb is used to indicate scroll position/bounds.
	*
	* @type {Boolean}
	* @default false
	* @see {@link module:enyo/Scroller~Scroller#thumb}
	* @public
	*/
	thumb: false,

	/**
	* If `true` (the default), animates the zoom action triggered by a double-tap
	* (or double-click).
	*
	* @type {Boolean}
	* @default true
	* @see {@link module:enyo/Scroller~Scroller#animate}
	* @public
	*/
	animate: true,

	/**
	* If `true` (the default), allows propagation of vertical drag events when
	* already at the top or bottom of the pannable area.
	*
	* @type {Boolean}
	* @default true
	* @see {@link module:enyo/Scroller~Scroller#verticalDragPropagation}
	* @public
	*/
	verticalDragPropagation: true,

	/**
	* If `true` (the default), allows propagation of horizontal drag events when
	* already at the left or right edge of the pannable area.
	*
	* @type {Boolean}
	* @default true
	* @see {@link module:enyo/Scroller~Scroller#horizontalDragPropagation}
	* @public
	*/
	horizontalDragPropagation: true,

	/**
	* @lends module:layout/PanZoomViews~PanZoomViews.prototype
	* @public
	*/
	published: {
		/**
		* The scale at which the content should be displayed. This may be any
		* positive numeric value or one of the following key words (which will
		* be resolved to a value dynamically):
		*
		* * `'auto'`: Fits the content to the size of the PanZoomView.
		* * `'width'`: Fits the content to the width of the PanZoomView.
		* * `'height'`: Fits the content to the height of the PanZoomView.
		* * `'fit'`: Fits the content to the height and width of the PanZoomView; the
		* 	overflow of the larger dimension is cropped and the content is centered
		* 	along that axis.
		*
		* @type {String}
		* @default 'auto'
		* @public
		*/
		scale: 'auto',

		/**
		* If `true`, zoom functionality is disabled.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disableZoom: false,

		/**
		* Width of the scaled content.
		*
		* @type {Number}
		* @default null
		* @private
		*/
		contentWidth: null,

		/**
		* Height of the scaled content.
		*
		* @type {Number}
		* @default null
		* @public
		*/
		contentHeight: null
	},

	/**
	* @private
	*/
	events: {
		onZoom: ''
	},

	/**
	* @private
	*/
	touch: true,

	/**
	* @private
	*/
	preventDragPropagation: false,

	/**
	* @private
	*/
	handlers: {
		ondragstart: 'dragPropagation',
		onSetDimensions: 'setDimensions'
	},

	/**
	* @private
	*/
	components: [
		{name: 'animator', kind: Animator, onStep: 'zoomAnimationStep', onEnd: 'zoomAnimationEnd'},
		{name: 'viewport', style: 'overflow:hidden;min-height:100%;min-width:100%;', classes: 'enyo-fit', ongesturechange: 'gestureTransform', ongestureend: 'saveState', ontap: 'singleTap', onmousewheel: 'mousewheel', ondown: 'handleDown', components: [
			{name: 'content'}
		]}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		// remember scale keyword
		this.scaleKeyword = this.scale;

		// Cache instance components
		var instanceComponents = this.components;
		this.components = [];
		Scroller.prototype.create.apply(this, arguments);
		this.$.content.applyStyle('width', this.contentWidth + 'px');
		this.$.content.applyStyle('height', this.contentHeight + 'px');

		if (this.unscaledComponents){
			var owner = this.hasOwnProperty('unscaledComponents') ? this.getInstanceOwner() : this;
			this.createComponents(this.unscaledComponents, {owner: owner});
		}

		// Change controlParentName so PanZoomView instance components are created into viewport
		this.controlParentName = 'content';
		this.discoverControlParent();
		this.createComponents(instanceComponents);

		this.canTransform = dom.canTransform();
		if (!this.canTransform) {
			this.$.content.applyStyle('position', 'relative');
		}
		this.canAccelerate = dom.canAccelerate();

		//	For panzoomview, disable drags during gesture (to fix flicker: ENYO-1208)
		this.getStrategy().setDragDuringGesture(false);
	},

	/**
	* @method
	* @private
	*/
	rendered: function () {
		Scroller.prototype.rendered.apply(this, arguments);
		this.getOriginalScale();
	},

	/**
	* @private
	*/
	dragPropagation: function (sender, event) {
		// Propagate drag events at the edges of the content as desired by the
		// verticalDragPropagation and horizontalDragPropagation properties
		var bounds = this.getStrategy().getScrollBounds();
		var verticalEdge = ((bounds.top===0 && event.dy>0) || (bounds.top>=bounds.maxTop-2 && event.dy<0));
		var horizontalEdge = ((bounds.left===0 && event.dx>0) || (bounds.left>=bounds.maxLeft-2 && event.dx<0));
		return !((verticalEdge && this.verticalDragPropagation) || (horizontalEdge && this.horizontalDragPropagation));
	},

	/**
	* @private
	*/
	mousewheel: function (sender, event) {
		event.pageX |= (event.clientX + event.target.scrollLeft);
		event.pageY |= (event.clientY + event.target.scrollTop);
		var zoomInc = (this.maxScale - this.minScale)/10;
		var oldScale = this.scale;
		if ((event.wheelDelta > 0) || (event.detail < 0)) { //zoom in
			this.scale = this.limitScale(this.scale + zoomInc);
		} else if ((event.wheelDelta < 0) || (event.detail > 0)) { //zoom out
			this.scale = this.limitScale(this.scale - zoomInc);
		}
		this.eventPt = this.calcEventLocation(event);
		this.transform(this.scale);
		if (oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
		// Prevent default scroll wheel action and prevent event from bubbling up to to touch scroller
		event.preventDefault();
		return true;
	},

	/**
	* Ensure that hold is canceled onMove (vs onLeave) so drag event occur as expected
	*
	* @private
	*/
	handleDown: function (sender, event) {
		event.configureHoldPulse({
			endHold: 'onMove'
		});
	},

	/**
	* @method
	* @private
	*/
	handleResize: function () {
		Scroller.prototype.handleResize.apply(this, arguments);
		this.scaleChanged();
	},

	/**
	* @private
	*/
	setDimensions: function (sender, event) {
		this.$.content.applyStyle('width', event.width + 'px');
		this.$.content.applyStyle('height', event.height + 'px');
		this.originalWidth = event.width;
		this.originalHeight = event.height;
		this.scale = this.scaleKeyword;
		this.scaleChanged();
		return true;
	},

	/**
	* Caches the initial height and width of the component (in `originalHeight`
	* and `originalWidth`, respectively) at render time.
	*
	* @private
	*/
	getOriginalScale : function () {
		if (this.$.content.hasNode()){
			this.originalWidth  = this.$.content.node.clientWidth;
			this.originalHeight = this.$.content.node.clientHeight;
			this.scale = this.scaleKeyword;
			this.scaleChanged();
		}
	},

	/**
	* Calculates the `minScale` and `maxScale` and zooms the content according to the
	* clamped scale value.
	*
	* @private
	*/
	scaleChanged: function () {
		var containerNode = this.hasNode();
		if (containerNode) {
			this.containerWidth = containerNode.clientWidth;
			this.containerHeight = containerNode.clientHeight;
			var widthScale = this.containerWidth / this.originalWidth;
			var heightScale = this.containerHeight / this.originalHeight;
			this.minScale = Math.min(widthScale, heightScale);
			this.maxScale = (this.minScale*3 < 1) ? 1 : this.minScale*3;
			//resolve any keyword scale values to solid numeric values
			if (this.scale == 'auto') {
				this.scale = this.minScale;
			} else if (this.scale == 'width') {
				this.scale = widthScale;
			} else if (this.scale == 'height') {
				this.scale = heightScale;
			} else if (this.scale == 'fit') {
				this.fitAlignment = 'center';
				this.scale = Math.max(widthScale, heightScale);
			} else {
				this.maxScale = Math.max(this.maxScale, this.scale);
				this.scale = this.limitScale(this.scale);
			}
		}
		this.eventPt = this.calcEventLocation();
		this.transform(this.scale);
		// start scroller
		if (this.getStrategy().$.scrollMath) {
			this.getStrategy().$.scrollMath.start();
		}
		this.align();
	},

	/**
	* Centers the content in the scroller.
	*
	* @private
	*/
	align: function () {
		if (this.fitAlignment && this.fitAlignment === 'center') {
			var sb = this.getScrollBounds();
			this.setScrollLeft(sb.maxLeft / 2);
			this.setScrollTop(sb.maxTop / 2);
		}
	},

	/**
	* @private
	*/
	gestureTransform: function (sender, event) {
		this.eventPt = this.calcEventLocation(event);
		this.transform(this.limitScale(this.scale * event.scale));
	},

	/**
	* Determines the target coordinates on the PanZoomView from an event.
	*
	* @private
	*/
	calcEventLocation: function (event) {
		var eventPt = {x: 0, y:0};
		if (event && this.hasNode()) {
			var rect = this.node.getBoundingClientRect();
			eventPt.x = Math.round((event.pageX - rect.left) - this.bounds.x);
			eventPt.x = Math.max(0, Math.min(this.bounds.width, eventPt.x));
			eventPt.y = Math.round((event.pageY - rect.top) - this.bounds.y);
			eventPt.y = Math.max(0, Math.min(this.bounds.height, eventPt.y));
		}
		return eventPt;
	},

	/**
	* Scales the content.
	*
	* @param {Number} scale - The scaling factor.
	* @private
	*/
	transform: function (scale) {
		this.tapped = false;

		var prevBounds = this.bounds || this.innerBounds(scale);
		this.bounds = this.innerBounds(scale);

		//style cursor if needed to indicate the content is movable
		if (this.scale>this.minScale) {
			this.$.viewport.applyStyle('cursor', 'move');
		} else {
			this.$.viewport.applyStyle('cursor', null);
		}
		this.$.viewport.setBounds({width: this.bounds.width + 'px', height: this.bounds.height + 'px'});

		//determine the exact ratio where on the content was tapped
		this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / prevBounds.width;
		this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / prevBounds.height;
		var scrollLeft, scrollTop;
		if (this.$.animator.ratioLock) { //locked for smartzoom
			scrollLeft = (this.$.animator.ratioLock.x * this.bounds.width) - (this.containerWidth / 2);
			scrollTop = (this.$.animator.ratioLock.y * this.bounds.height) - (this.containerHeight / 2);
		} else {
			scrollLeft = (this.ratioX * this.bounds.width) - this.eventPt.x;
			scrollTop = (this.ratioY * this.bounds.height) - this.eventPt.y;
		}
		scrollLeft = Math.max(0, Math.min((this.bounds.width - this.containerWidth), scrollLeft));
		scrollTop = Math.max(0, Math.min((this.bounds.height - this.containerHeight), scrollTop));

		if (this.canTransform) {
			var params = {scale: scale};
			// translate needs to be first, or scale and rotation will not be in the correct spot
			if (this.canAccelerate) {
				//translate3d rounded values to avoid distortion; ref: http://martinkool.com/post/27618832225/beware-of-half-pixels-in-css
				params = utils.mixin({translate3d: Math.round(this.bounds.left) + 'px, ' + Math.round(this.bounds.top) + 'px, 0px'}, params);
			} else {
				params = utils.mixin({translate: this.bounds.left + 'px, ' + this.bounds.top + 'px'}, params);
			}
			dom.transform(this.$.content, params);
		} else {
			// ...no transforms means there's nothin' I can do.
		}

		//adjust scroller to new position that keeps ratio with the new content size
		this.setScrollLeft(scrollLeft);
		this.setScrollTop(scrollTop);

		this.positionClientControls(scale);

		//this.stabilize();
	},

	/**
	* Clamps the scaling factor between `minScale` and `maxScale`.
	*
	* @private
	*/
	limitScale: function (scale) {
		if (this.disableZoom) {
			scale = this.scale;
		} else if (scale > this.maxScale) {
			scale = this.maxScale;
		} else if (scale < this.minScale) {
			scale = this.minScale;
		}
		return scale;
	},

	/**
	* Calculates the offsets for the content for the given scaling factor.
	*
	* @param {Number} scale - The scaling factor.
	* @return {Object}      - Object containing offsets for content (in its `left`, `top`,
	* `width`, `height`, `x`, and `y` properties).
	* @private
	*/
	innerBounds: function (scale) {
		var width = this.originalWidth * scale;
		var height = this.originalHeight * scale;
		var offset = {x:0, y:0, transX:0, transY:0};
		if (width < this.containerWidth) {
			offset.x += (this.containerWidth - width)/2;
		}
		if (height < this.containerHeight) {
			offset.y += (this.containerHeight - height)/2;
		}
		if (this.canTransform) { //adjust for the css translate, which doesn't alter content offsetWidth and offsetHeight
			offset.transX -= (this.originalWidth - width)/2;
			offset.transY -= (this.originalHeight - height)/2;
		}
		return {left:offset.x + offset.transX, top:offset.y + offset.transY, width:width, height:height, x:offset.x, y:offset.y};
	},

	/**
	* Persists the scaling factor when a gesture finishes.
	*
	* @fires module:layout/PanZoomView~PanZoomView#onZoom
	* @private
	*/
	saveState: function (sender, event) {
		var oldScale = this.scale;
		this.scale *= event.scale;
		this.scale = this.limitScale(this.scale);
		if (oldScale != this.scale) {
			this.doZoom({scale:this.scale});
		}
		this.ratioX = this.ratioY = null;
	},

	/**
	* Simulates double-tap by watching for two taps within 300ms of each other.
	*
	* @private
	*/
	singleTap: function (sender, event) {
		setTimeout(this.bindSafely(function () {
			this.tapped = false;
		}), 300);
		if (this.tapped) { //dbltap
			this.tapped = false;
			this.smartZoom(sender, event);
		} else {
			this.tapped = true;
		}
	},

	/**
	* Zooms at the event location.
	*
	* @private
	*/
	smartZoom: function (sender, event) {
		var containerNode = this.hasNode();
		var imgNode = this.$.content.hasNode();
		if (containerNode && imgNode && this.hasNode() && !this.disableZoom) {
			var prevScale = this.scale;
			if (this.scale != this.minScale) { //zoom out
				this.scale = this.minScale;
			} else { //zoom in
				this.scale = this.maxScale;
			}
			this.eventPt = this.calcEventLocation(event);
			if (this.animate) {
				//lock ratio position of event, and animate the scale change
				var ratioLock = {
					x: ((this.eventPt.x + this.getScrollLeft()) / this.bounds.width),
					y: ((this.eventPt.y + this.getScrollTop()) / this.bounds.height)
				};
				this.$.animator.play({
					duration: 350,
					ratioLock: ratioLock,
					baseScale: prevScale,
					deltaScale: this.scale - prevScale
				});
			} else {
				this.transform(this.scale);
				this.doZoom({scale:this.scale});
			}
		}
	},

	/**
	* @private
	*/
	zoomAnimationStep: function (inSender, inEvent) {
		var currScale = this.$.animator.baseScale + (this.$.animator.deltaScale * this.$.animator.value);
		this.transform(currScale);
		return true;
	},

	/**
	* @private
	*/
	zoomAnimationEnd: function (inSender, inEvent) {
		this.stabilize();
		this.doZoom({scale:this.scale});
		this.$.animator.ratioLock = undefined;
		return true;
	},

	/**
	* @fires module:layout/PanZoomView~PanZoomView#onPositionPin
	* @private
	*/
	positionClientControls: function (scale) {
		this.waterfallDown('onPositionPin', {
			scale: scale,
			bounds: this.bounds
		});
	}
});

}],'layout/ImageView':[function (module,exports,global,require,request){
/**
* Contains the declaration for the {@link module:layout/ImageView~ImageView} kind.
* @module layout/ImageView
*/

var
	kind = require('enyo/kind'),
	dom = require('enyo/dom'),
	logger = require('enyo/logger'),
	platform = require('enyo/platform'),
	Img = require('enyo/Image');

var
	PanZoomView = require('./PanZoomView');

/**
* {@link module:layout/ImageView~ImageView} is a control that displays an image
* at a given scaling factor, with enhanced support for double-tap/double-click
* to zoom, panning, mousewheel zooming and pinch-zoom (on touchscreen devices
* that support it).
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		ImageView = require('layout/ImageView');
*
* 	{kind: ImageView, src: 'layout/assets/globe.jpg', scale: 'auto',
* 		style: 'width: 500px; height: 400px;'}
* ```
*
* The `onload` and `onerror` events bubble up from the underlying image
* element and an [onZoom]{@link module:layout/PanZoomView~PanZoomView#onZoom} event is triggered
* when the user changes the zoom level of the image.
*
* If you wish, you may add {@link module:enyo/ScrollThumb~ScrollThumb} indicators, disable zoom
* animation, allow panning overscroll (with a bounce-back effect), and control
* the propagation of drag events, all using this kind's Boolean properties.
*
* Note that it's best to specify a size for the ImageView in order to avoid
* complications.
*
* @class ImageView
* @extends module:layout/PanZoomView~PanZoomView
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:layout/ImageView~ImageView.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.ImageView',

	/**
	* @private
	*/
	kind: PanZoomView,

	/**
	* @private
	*/
	subKindComponents: [
		{kind: Img, ondown: 'down', style: 'vertical-align: text-top;'}
	],

	/**
	* @method
	* @private
	*/
	create: function () {
		// move components (most likely imageViewPins) to unscaledComponents
		this.unscaledComponents = this.components;
		this.components = [];

		//amend kindComponents
		this.kindComponents[1].components[0].components = this.subKindComponents;

		PanZoomView.prototype.create.apply(this, arguments);

		// set content as inline-block to mimic behaviour of an image
		this.$.content.applyStyle('display', 'inline-block');

		//offscreen buffer image to get initial image dimensions
		//before displaying a scaled down image that can fit in the container
		this.bufferImage = new Image();
		this.bufferImage.onload = this.bindSafely('imageLoaded');
		this.bufferImage.onerror = this.bindSafely('imageError');
		this.srcChanged();
		//	Needed to kickoff pin redrawing (otherwise they won't redraw on intitial scroll)
		if(this.getStrategy().$.scrollMath) {
			this.getStrategy().$.scrollMath.start();
		}
	},

	/**
	* @method
	* @private
	*/
	destroy: function () {
		if (this.bufferImage) {
			this.bufferImage.onerror = undefined;
			this.bufferImage.onerror = undefined;
			delete this.bufferImage;
		}
		PanZoomView.prototype.destroy.apply(this, arguments);
	},

	/**
	* @private
	*/
	down: function (sender, event) {
		// Fix to prevent image drag in Firefox
		event.preventDefault();
	},

	/**
	* @private
	*/
	srcChanged: function () {
		if(this.src && this.src.length>0 && this.bufferImage && this.src!=this.bufferImage.src) {
			this.bufferImage.src = this.src;
		}
	},

	/**
	* Handles `onload` events bubbled up from children to reset the scale when
	* the image changes.
	*
	* @private
	*/
	imageLoaded: function (event) {
		this.scale = this.scaleKeyword;
		this.originalWidth = this.contentWidth = this.bufferImage.width;
		this.originalHeight = this.contentHeight = this.bufferImage.height;

		//scale to fit before setting src, so unscaled image isn't visible
		this.scaleChanged();
		this.$.image.setSrc(this.bufferImage.src);

		// There appears to be a bug in Safari where due to the translation of these elements it
		// doesn't correctly render unless prodded
		if (platform.safari) {
			var n = this.$.image.hasNode(),
				src = this.bufferImage.src;

			if (n) {
				setTimeout(function () { n.src = src; }, 100);
			}
		}

		// Needed to ensure scroller contents height/width is calculated correctly when contents use enyo-fit
		dom.transformValue(this.getStrategy().$.client, 'translate3d', '0px, 0px, 0');

		this.positionClientControls(this.scale);
		this.align();
	},

	/**
	* @private
	*/
	imageError: function (event) {
		logger.error('Error loading image: ' + this.src);
		//bubble up the error event
		this.bubble('onerror', event);
	}
});

},{'./PanZoomView':'layout/PanZoomView'}]
	};

});
//# sourceMappingURL=layout.js.map