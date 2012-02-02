/*
	jQuery Select Box Plugin 
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// when is a select box not a select box?
// version 1.0 - initial build
// version 2.0 - integrated new plugin architecture: https://github.com/dansdom/plugins-template-v2

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.FauxSelectBox = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "testPlugin";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.FauxSelectBox.settings, options);
		this.init();
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.FauxSelectBox.settings = {
		'selectedBox' : 'selectedBox',
        'hideTimer' : 500,
        'ulWrapper' : true,
        'ulContainer' : 'listContainer',
        'activeClass' : 'active',
        'groupClass' : 'selectGroup'
	};
	
	// plugin functions go here
	$.FauxSelectBox.prototype = {
		init : function() {
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var myObject = this;
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			// build the list from the selectbox and then hide the original
			this.buildList();
			
			// add event handling to the list
			this.addEvents()
			
		},
		// build the faux dropdown components
		buildList : function()
		{
			var fauxSelect = "",
				selectList = this.el.children(),
				selectLength = selectList.length,
				selectedItem = "",
				i,
				j;
				//console.log(selectLength);
				
			if (this.opts.ulWrapper == true)
			{
				fauxSelect = "<div class='" + this.opts.ulContainer + "' style='display:none'><ul>";
			}
			else
			{
				fauxSelect = "<ul style='display:none'>";
			}
			
			for (i = 0; i < selectLength; i++)
			{
				// I need to test for option groups and then construct them as well
				//console.log(selectList[i]);
				if (selectList[i].nodeName == "OPTGROUP")
				{
					var optGroup = $(selectList[i]),
						groupList = "<li class='" + this.opts.groupClass + "'>",
						// get the label on the optgroup and add that to the list         	 	
						groupLabel = optGroup.attr("label");
						
					groupList += "<label>" + groupLabel + "</label><ul>";
					// iterate over the optgroup and construct a sublist
					for (j = 0; j < optGroup.children().length; j++)
					{
						var groupItem = optGroup.children(":eq(" + j + ")");  
						//console.log(groupItem.attr("selected"));         	 		   
						//console.log(groupList);    	 		
						groupList += "<li value='" + groupItem.attr("value") + "' selected='" + groupItem.attr("selected") + "' class='" + this.opts.groupClass + j + "'>" + groupItem.html() + "</li>";
						//console.log(groupList);
						if (groupItem.attr("selected") == true)
						{
							selectedItem = groupItem.html();
						}
					}         	 	      	 	
					groupList += "</ul></li>";
					//console.error(groupList);
					fauxSelect += groupList;
				}
				else
				{
					fauxSelect += "<li value='" + selectList[i].value + "' selected='" + selectList[i].selected + "' class='option" + i + "'>" + selectList[i].text + "</li>";
				}
				 
				if (selectList[i].selected == true)
				{
					selectedItem = selectList[i].text;
				}
			}
			 
			if (this.opts.ulWrapper == true)
			{
				fauxSelect += "</ul></div>";
			}
			else
			{
				fauxSelect += "</ul>";
			}
			//console.log(fauxSelect);
			
			this.el.css("display", "none");
			this.el.parent().append("<div class='" + this.opts.selectedBox + "'>" + selectedItem + "</div>").append(fauxSelect);
		},
		// add event handling for all objects
		addEvents : function()
		{
			var fauxSelect = this,
				selectContainer = fauxSelect.el.parent(),
				selectList = selectContainer.find("ul"),
				clickIndex,
				selectTimer,
				optionValue,
				selectedBox = selectContainer.find("." + this.opts.selectedBox);
				
			if (this.opts.ulWrapper == true)
			{
				selectList = selectContainer.find("." + this.opts.ulContainer);
			}
   
			selectedBox.bind('click.' + this.namespace, function(){
				clearTimeout(selectTimer);
				fauxSelect.showSelectList(selectList)();
			});
   
			selectedBox.bind('mouseout.' + this.namespace, function(){
				clearTimeout(selectTimer);
				selectTimer = setTimeout(fauxSelect.hideSelectList(selectList), fauxSelect.opts.hideTimer);
			});
   
			selectList.find("li").bind('mouseenter.' + this.namespace, function(){
				clearTimeout(selectTimer);
				if ($(this).hasClass(fauxSelect.opts.groupClass) == false)
				{
				   $(this).addClass(fauxSelect.opts.activeClass);
				}
				$(this).parents("li").removeClass(fauxSelect.opts.activeClass);
			});
			
			selectList.find("li").bind('mouseleave.' + this.namespace, function(){
				clearTimeout(selectTimer);
				selectTimer = setTimeout(fauxSelect.hideSelectList(selectList), fauxSelect.opts.hideTimer);
				$(this).removeClass(fauxSelect.opts.activeClass);
			});
   
			selectList.find("li").each(function () {
			   $(this).bind('click.' + fauxSelect.namespace, function () {
				   
				   // check whether you are clicking on an optgroup
				   // if clicking on the label, then return without doing anything
				   if ($(this).hasClass(fauxSelect.opts.groupClass))
				   {
					   //console.log("i must be a label");
					   return false;
				   } 
				   
				   // clear all the options
				   fauxSelect.el.find("option").removeAttr("selected");
				   
				   // number of optGroups
				   var groups = fauxSelect.el.find("optgroup").length;
				   //console.log("groups: "+groups);
				   
				   // get the index of the list item
				   clickIndex = $(this).parent().children().index(this);
				   
				   // get the value of the select box
				   if ($(this).parents().hasClass(fauxSelect.opts.groupClass))
				   {
					   var itemPos = clickIndex;
					   //console.log("item pos: "+itemPos);
					   //console.log("true");
					   
					   
					   // overall index of the item being clicked
					   var overallIndex = $("." + fauxSelect.opts.ulContainer).find("li").index($(this));
					   //console.log("overall index: "+overallIndex);
					   
					   // get the index of this select group
					   var selectGroup = $(this).parents("." + fauxSelect.opts.groupClass);            	            		
					   
					   // the index of the group
					   var groupIndex = selectGroup.parent().children().index(selectGroup);
					   //console.log("group index: "+groupIndex);
					   
					   // find the groups before this one            		
					   var groupNumber = 0;
					   for (var x = 0; x < overallIndex; x++)
					   {            			
						   if ($("." + fauxSelect.opts.ulContainer).find("li:eq(" + x + ")").hasClass("selectGroup"))
						   {
							   groupNumber += 1;
						   }            			
					   }
					   
					   // i have to find how many items in select groups come before this one
					   clickIndex = overallIndex - groupNumber;
					   var selectIndex = overallIndex - groupNumber;            		            		
					   fauxSelect.el.find("option:eq(" + clickIndex + ")").attr("selected", "selected");    
					   
				   }
				   else
				   {            		
					   fauxSelect.el.children(":eq(" + clickIndex + ")").attr("selected", "selected");
				   }
																						   
				   fauxSelect.el.change();                
				   var selectedText = $(this).html();
				   selectedBox.html(selectedText);
				   clearTimeout(selectTimer);
				   selectList.css("display","none");
				   return false;
			   });
		   });
			// test that select box has fired change event
			//selectBox.change(function(){
			//    console.log("changed");
			//});
		},
		// hide the select list
		hideSelectList : function(selectList) {
			var fauxSelect = this;
            return function() {
                selectList.css("display","none");
                fauxSelect.el.next().removeClass("list-open");
            }
        },
		// show the select list
        showSelectList : function(selectList) {
			var fauxSelect = this;
            return function() {
                selectList.css("display","block");
                fauxSelect.el.next().addClass("list-open");
			}
        },
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		destroy : function() {
			this.el.unbind("." + this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.fauxSelectBox = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "fauxSelect",
			args;
		
		// if the argument is a string representing a plugin method then test which one it is
		if ( typeof options === 'string' ) {
			// define the arguments that the plugin function call may make 
			args = Array.prototype.slice.call( arguments, 1 );
			// iterate over each object that the function is being called upon
			this.each(function() {
				// test the data object that the DOM element that the plugin has for the DOM element
				var pluginInstance = $.data(this, pluginName);
				
				// if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
				if (!pluginInstance) {
					alert("The plugin has not been initialised yet when you tried to call this method: " + options);
					return;
				}
				// if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
				if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
					alert("the plugin contains no such method: " + options);
					return;
				}
				// apply the method that has been called
				else {
					pluginInstance[options].apply(pluginInstance, args);
				}
			});
			
		}
		// initialise the function using the arguments as the plugin options
		else {
			// initialise each instance of the plugin
			this.each(function() {
				// define the data object that is going to be attached to the DOM element that the plugin is being called on
				var pluginInstance = $.data(this, pluginName);
				// if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
				if (pluginInstance) {
					pluginInstance.option(options);
					// initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
					//pluginInstance.init(callback);
				}
				// initialise a new instance of the plugin
				else {
					$.data(this, pluginName, new $.FauxSelectBox(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
