/*
	jQuery Select Box Plugin 
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// when is a select box not a select box?

(function($){

	$.fn.fauxSelectBox = function(config)
	{
		// config - default settings
		var settings = {                              
                              'selectedBox' : 'selectedBox',
                              'hideTimer' : 500,
                              'ulWrapper' : true,
                              'ulContainer' : 'listContainer',
                              'activeClass' : 'active',
                              'groupClass' : 'selectGroup'
					 };

		// if settings have been defined then overwrite the default ones
          // comments:        true value makes the merge recursive. that is - 'deep' copy
		//				{} creates an empty object so that the second object doesn't overwrite the first object
		//				this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//				the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here

			// each box calling the plugin now has the variable name: myBox
			var selectBox = $(this);

			// build the list from the selectbox and then hide the original
			$.fn.fauxSelectBox.buildList(selectBox,opts);
			
			// add event handling to the list
			$.fn.fauxSelectBox.addEvents(selectBox,opts)

			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere,
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.

        $.fn.fauxSelectBox.hideSelectList = function(selectList,selectBox){
                return function(){
                    selectList.css("display","none");
                    selectBox.next().removeClass("list-open");
                }
        }

        $.fn.fauxSelectBox.showSelectList = function(selectList,selectBox){
                return function(){
                    selectList.css("display","block");
                    selectBox.next().addClass("list-open");
                }
        
        }
     // build the faux dropdown components
	$.fn.fauxSelectBox.buildList = function(selectBox,opts)
	{

         var fauxSelect = "",
             selectList = selectBox.children(),
             selectLength = selectList.length,
             selectedItem = "";
             //console.log(selectLength);

         if (opts.ulWrapper == true)
         {
             fauxSelect = "<div class='"+opts.ulContainer+"' style='display:none'><ul>";
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
         	 	var optGroup = $(selectList[i]);
         	 	var groupList = "<li class='"+opts.groupClass+"'>";         	 	
         	 	// get the label on the optgroup and add that to the list         	 	
         	 	var groupLabel = optGroup.attr("label");
         	 	groupList += "<label>"+groupLabel+"</label><ul>";
         	 	// iterate over the optgroup and construct a sublist
         	 	for (var j = 0; j < optGroup.children().length; j++)
         	 	{
         	 		var groupItem = optGroup.children(":eq("+j+")");  
         	 		//console.log(groupItem.attr("selected"));         	 		   
         	 		//console.log(groupList);    	 		
         	 		groupList += "<li value='"+groupItem.attr("value")+"' selected='"+groupItem.attr("selected")+"' class='"+opts.groupClass+j+"'>" + groupItem.html() + "</li>";
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
             	fauxSelect += "<li value='"+selectList[i].value+"' selected='"+selectList[i].selected+"' class='option"+i+"'>" + selectList[i].text + "</li>";
             }
             
             if (selectList[i].selected == true)
             {
                 selectedItem = selectList[i].text;
             }
         }
         
         if (opts.ulWrapper == true)
         {
             fauxSelect += "</ul></div>";
         }
         else
         {
             fauxSelect += "</ul>";
         }
         //console.log(fauxSelect);

         selectBox.css("display","none");
         selectBox.parent().append("<div class='"+opts.selectedBox+"'>"+selectedItem+"</div>").append(fauxSelect);
	};

     // add event handling for all objects
     $.fn.fauxSelectBox.addEvents = function(selectBox,opts)
	{
         var selectContainer = selectBox.parent(),
             selectList = selectContainer.find("ul"),
             clickIndex,
             selectTimer,
             optionValue,
             selectedBox = selectContainer.find("."+opts.selectedBox);
             
         if (opts.ulWrapper == true)
         {
             selectList = selectContainer.find("."+opts.ulContainer);
         }

         selectedBox.click(function(){
             clearTimeout(selectTimer);
             $.fn.fauxSelectBox.showSelectList(selectList,selectBox)();
         });

         selectedBox.mouseout(function(){
             clearTimeout(selectTimer);
             selectTimer = setTimeout($.fn.fauxSelectBox.hideSelectList(selectList,selectBox),opts.hideTimer);
         });

         selectList.find("li").mouseenter(function(){
             clearTimeout(selectTimer);
             if ($(this).hasClass(opts.groupClass) == false)
             {
             	$(this).addClass(opts.activeClass);
             }
             $(this).parents("li").removeClass(opts.activeClass);
         });
         
         selectList.find("li").mouseleave(function(){
             clearTimeout(selectTimer);
             selectTimer = setTimeout($.fn.fauxSelectBox.hideSelectList(selectList,selectBox),opts.hideTimer);
             $(this).removeClass(opts.activeClass);
         });

         selectList.find("li").each(function () {
            $(this).click(function () {
            
            	
            	// check whether you are clicking on an optgroup
            	// if clicking on the label, then return without doing anything
            	if ($(this).hasClass(opts.groupClass))
            	{
            		//console.log("i must be a label");
            		return false;
            	} 
            	
            	// clear all the options
            	selectBox.find("option").removeAttr("selected");
            	
            	// number of optGroups
            	var groups = selectBox.find("optgroup").length;
            	//console.log("groups: "+groups);
            	
            	// get the index of the list item
            	clickIndex = $(this).parent().children().index(this);
            	
            	// get the value of the select box
            	if ($(this).parents().hasClass(opts.groupClass))
            	{
            		var itemPos = clickIndex;
            		//console.log("item pos: "+itemPos);
            		//console.log("true");
            		
            		
            		// overall index of the item being clicked
            		overallIndex = $("."+opts.ulContainer).find("li").index($(this));
            		//console.log("overall index: "+overallIndex);
            		
            		// get the index of this select group
            		var selectGroup = $(this).parents("."+opts.groupClass);            	            		
            		
            		// the index of the group
            		var groupIndex = selectGroup.parent().children().index(selectGroup);
            		//console.log("group index: "+groupIndex);
            		
            		// find the groups before this one            		
            		var groupNumber = 0;
            		for (var x = 0; x < overallIndex; x++)
            		{            			
            			if ($("."+opts.ulContainer).find("li:eq("+x+")").hasClass("selectGroup"))
            			{
            				groupNumber += 1;
            			}            			
            		}
            		
            		// i have to find how many items in select groups come before this one
            		clickIndex = overallIndex - groupNumber;
            		var selectIndex = overallIndex - groupNumber;            		            		
                	selectBox.find("option:eq(" + clickIndex + ")").attr("selected", "selected");    
                	
            	}
            	else
            	{            		
                	selectBox.children(":eq(" + clickIndex + ")").attr("selected", "selected");
            	}
            	               	                                                        
                selectBox.change();                
                selectedText = $(this).html();
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
     };


	// end of module
})(jQuery);
