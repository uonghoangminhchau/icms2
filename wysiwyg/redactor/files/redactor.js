/*
	Redactor v9.2.6
	Updated: Jul 19, 2014
	http://imperavi.com/redactor/
	Copyright (c) 2009-2014, Imperavi LLC.
	License: http://imperavi.com/redactor/license/
	Usage: $('#content').redactor();
*/
(function($)
{
	var uuid = 0;

	"use strict";

	var Range = function(range)
	{
		this[0] = range.startOffset;
		this[1] = range.endOffset;

		this.range = range;

		return this;
	};

	Range.prototype.equals = function()
	{
		return this[0] === this[1];
	};

	var reUrlYoutube = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
	var reUrlVimeo = /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;
    var reUrlFacebook = /^(?:(?:https|http)?:\/\/)?(?:www\.)?(?:facebook\.com(?:\/[^\/]+\/videos\/|\/video\.php\?v=))([0-9]+)(?:.+)?$/;
	var reUrlRutube = /^(?:(?:https|http)?:\/\/)?(?:www\.)?(?:rutube\.ru\/video\/)([a-z0-9]+)(?:.+)?$/;

	$.fn.redactor = function(options)
	{
		var val = [];
		var args = Array.prototype.slice.call(arguments, 1);

		if (typeof options === 'string')
		{
			this.each(function()
			{
				var instance = $.data(this, 'redactor');
				if (typeof instance !== 'undefined' && $.isFunction(instance[options]))
				{
					var methodVal = instance[options].apply(instance, args);
					if (methodVal !== undefined && methodVal !== instance) val.push(methodVal);
				}
				else return $.error('No such method "' + options + '" for Redactor');
			});
		}
		else
		{
			this.each(function()
			{
				if (!$.data(this, 'redactor')) $.data(this, 'redactor', Redactor(this, options));
			});
		}

		if (val.length === 0) return this;
		else if (val.length === 1) return val[0];
		else return val;

	};

	function Redactor(el, options)
	{
		return new Redactor.prototype.init(el, options);
	}

	$.Redactor = Redactor;
	$.Redactor.VERSION = '9.2.6';
	$.Redactor.opts = {

			rangy: false,

			iframe: false,
			fullpage: false,
			css: false,

			lang: 'en',
			direction: 'ltr',

			placeholder: false,

			typewriter: false,
			wym: false,
			mobile: true,
			cleanup: true,
			tidyHtml: true,
			pastePlainText: false,
			removeEmptyTags: true,
			cleanSpaces: true,
			cleanFontTag: true,
			templateVars: false,
			xhtml: false,

			visual: true,
			focus: false,
			tabindex: false,
			autoresize: true,
			minHeight: false,
			maxHeight: false,
			shortcuts: {
				'ctrl+m, meta+m': "this.execCommand('removeFormat', false)",
				'ctrl+b, meta+b': "this.execCommand('bold', false)",
				'ctrl+i, meta+i': "this.execCommand('italic', false)",
				'ctrl+h, meta+h': "this.execCommand('superscript', false)",
				'ctrl+l, meta+l': "this.execCommand('subscript', false)",
				'ctrl+k, meta+k': "this.linkShow()",
				'ctrl+shift+7': "this.execCommand('insertorderedlist', false)",
				'ctrl+shift+8': "this.execCommand('insertunorderedlist', false)"
			},
			shortcutsAdd: false,

			autosave: false,
			autosaveInterval: 60,

			plugins: false,

			linkProtocol: 'http://',
			linkNofollow: false,
			linkSize: 50,
			predefinedLinks: false,

			imageFloatMargin: '10px',
			imageGetJson: false,

			dragUpload: true,
			imageTabLink: true,
			imageUpload: false,
			imageUploadParam: 'file',
			imageResizable: true,

			fileUpload: false,
			fileUploadParam: 'file',
			clipboardUpload: true,
			clipboardUploadUrl: false,

			smilesUrl: '',

			dnbImageTypes: ['image/png', 'image/jpeg', 'image/gif'],

			s3: false,
			uploadFields: false,

			observeImages: true,
			observeLinks: true,

			modalOverlay: true,

			tabSpaces: false,
			tabFocus: true,

			air: false,
			airButtons: ['formatting', 'bold', 'italic', 'deleted', 'unorderedlist', 'orderedlist', 'outdent', 'indent'],

			toolbar: true,
			toolbarFixed: false,
			toolbarFixedTarget: document,
			toolbarFixedTopOffset: 0,
			toolbarFixedBox: false,
			toolbarExternal: false,
			toolbarOverflow: false,
			buttonSource: true,

			buttons: ['html', 'undo', 'redo', 'formatting', 'bold', 'italic', 'deleted', 'unorderedlist', 'orderedlist',
					  'outdent', 'indent', 'image', 'video', 'file', 'table', 'link', 'alignment', '|',
					  'horizontalrule'], /**'underline', 'alignleft', 'aligncenter', 'alignright', 'justify'**/
			buttonsHideOnMobile: [],

			activeButtons: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist',
							'alignleft', 'aligncenter', 'alignright', 'justify', 'table'],
			activeButtonsStates: {
				b: 'bold',
				strong: 'bold',
				i: 'italic',
				em: 'italic',
				del: 'deleted',
				strike: 'deleted',
				ul: 'unorderedlist',
				ol: 'orderedlist',
				u: 'underline',
				tr: 'table',
				td: 'table',
				table: 'table'
			},

			formattingTags: ['p', 'blockquote', 'code', 'h2', 'h3', 'h4', 'h5', 'h6'],

			linebreaks: false,
			paragraphy: true,
			convertDivs: true,
			convertLinks: true,
			convertImageLinks: false,
			convertVideoLinks: false,
			formattingPre: false,
			phpTags: false,

			allowedTags: false,
			deniedTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'],

			boldTag: 'strong',
			italicTag: 'em',

			indentValue: 20,
			buffer: [],
			rebuffer: [],
			textareamode: false,
			emptyHtml: '<p>&#x200b;</p>',
			invisibleSpace: '&#x200b;',
			rBlockTest: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
			alignmentTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'],
			ownLine: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
			contOwnLine: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
			newLevel: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'code', 'select', 'td', 'th', 'tr', 'ul'],
			blockLevelElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
								'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'CODE', 'ADDRESS', 'SECTION',
								'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'],
			langs: {
				en: {
					html: 'HTML',
					video: 'Insert Video',
					image: 'Insert Image',
					table: 'Table',
					link: 'Link',
					link_insert: 'Insert link',
					link_edit: 'Edit link',
					unlink: 'Unlink',
					formatting: 'Formatting',
					paragraph: 'Normal text',
					quote: 'Quote',
					code: 'Code',
					header1: 'Header 1',
					header2: 'Header 2',
					header3: 'Header 3',
					header4: 'Header 4',
					header5: 'Header 5',
					bold: 'Bold',
					italic: 'Italic',
					fontcolor: 'Font Color',
					backcolor: 'Back Color',
					unorderedlist: 'Unordered List',
					orderedlist: 'Ordered List',
					outdent: 'Outdent',
					indent: 'Indent',
					cancel: 'Cancel',
					insert: 'Insert',
					save: 'Save',
					_delete: 'Delete',
					insert_table: 'Insert Table',
					insert_row_above: 'Add Row Above',
					insert_row_below: 'Add Row Below',
					insert_column_left: 'Add Column Left',
					insert_column_right: 'Add Column Right',
					delete_column: 'Delete Column',
					delete_row: 'Delete Row',
					delete_table: 'Delete Table',
					rows: 'Rows',
					columns: 'Columns',
					add_head: 'Add Head',
					delete_head: 'Delete Head',
					title: 'Title',
					image_position: 'Position',
					none: 'None',
					left: 'Left',
					right: 'Right',
					center: 'Center',
					image_web_link: 'Image Web Link',
					text: 'Text',
					mailto: 'Email',
					web: 'URL',
					video_html_code: 'Video Embed Code',
					file: 'Insert File',
					upload: 'Upload',
					download: 'Download',
					choose: 'Choose',
					empty_img_list: 'You have no images',
					or_choose: 'Or choose',
					drop_file_here: 'Drop file here',
					align_left: 'Align text to the left',
					align_center: 'Center text',
					align_right: 'Align text to the right',
					align_justify: 'Justify text',
					horizontalrule: 'Insert Horizontal Rule',
                    fullscreen: 'Full screen',
                    fontsize: 'Font size',
                    fontfamily: 'Font',
                    remove_font: 'Clear Font',
                    image_save_toserver: 'Save to the server?',
					deleted: 'Deleted',
					anchor: 'Anchor',
					link_new_tab: 'Open link in new tab',
					underline: 'Underline',
					alignment: 'Alignment',
					filename: 'Name (optional)',
					edit: 'Edit',
                    spoiler: 'Spoiler',
                    spoiler_name: 'Spoiler name',
                    spoiler_text: 'Spoiler text',
                    smiles: 'Smiles',
                    undo: 'Undo',
                    redo: 'Redo',
                    formalize: 'Formalize'
				}
			}
	};

	Redactor.fn = $.Redactor.prototype = {

		keyCode: {
			BACKSPACE: 8,
			DELETE: 46,
			DOWN: 40,
			ENTER: 13,
			ESC: 27,
			TAB: 9,
			CTRL: 17,
			META: 91,
			LEFT: 37,
			LEFT_WIN: 91
		},

		init: function(el, options)
		{
			this.rtePaste = false;
			this.$element = this.$source = $(el);
			this.uuid = uuid++;

			var opts = $.extend(true, {}, $.Redactor.opts);

			this.opts = $.extend(
				{},
				opts,
				this.$element.data(),
				options
			);

			this.start = true;
			this.dropdowns = [];

			this.sourceHeight = this.$source.css('height');
			this.sourceWidth = this.$source.css('width');

			if (this.opts.fullpage) this.opts.iframe = true;
			if (this.opts.linebreaks) this.opts.paragraphy = false;
			if (this.opts.paragraphy) this.opts.linebreaks = false;
			if (this.opts.toolbarFixedBox) this.opts.toolbarFixed = true;

			this.document = document;
			this.window = window;

			this.savedSel = false;

			this.cleanlineBefore = new RegExp('^<(/?' + this.opts.ownLine.join('|/?' ) + '|' + this.opts.contOwnLine.join('|') + ')[ >]');
			this.cleanlineAfter = new RegExp('^<(br|/?' + this.opts.ownLine.join('|/?' ) + '|/' + this.opts.contOwnLine.join('|/') + ')[ >]');
			this.cleannewLevel = new RegExp('^</?(' + this.opts.newLevel.join('|' ) + ')[ >]');

			this.rTestBlock = new RegExp('^(' + this.opts.blockLevelElements.join('|' ) + ')$', 'i');

			if (this.opts.linebreaks === false)
			{
				if (this.opts.allowedTags !== false)
				{
					var arrSearch = ['strong', 'em', 'del'];
					var arrAdd = ['b', 'i', 'strike'];

					if ($.inArray('p', this.opts.allowedTags) === '-1') this.opts.allowedTags.push('p');

					for (i in arrSearch)
					{
						if ($.inArray(arrSearch[i], this.opts.allowedTags) != '-1') this.opts.allowedTags.push(arrAdd[i]);
					}
				}

				if (this.opts.deniedTags !== false)
				{
					var pos = $.inArray('p', this.opts.deniedTags);
					if (pos !== '-1') this.opts.deniedTags.splice(pos, pos);
				}
			}

			if (this.browser('msie') || this.browser('opera'))
			{
				this.opts.buttons = this.removeFromArrayByValue(this.opts.buttons, 'horizontalrule');
			}

			this.opts.curLang = this.opts.langs[this.opts.lang];

			$.extend(this.opts.shortcuts, this.opts.shortcutsAdd);

			this.placeholderInit();

			this.buildStart();

		},
		toolbarInit: function(lang)
		{
			return {
				html:
				{
					title: lang.html,
					func: 'toggle'
				},
				undo:
				{
					title: lang.undo,
					func: 'bufferUndo'
				},
				redo:
				{
					title: lang.redo,
					func: 'bufferRedo'
				},
				formatting:
				{
					title: lang.formatting,
					func: 'show',
					dropdown:
					{
						p:
						{
							title: lang.paragraph,
							func: 'formatBlocks'
						},
						blockquote:
						{
							title: lang.quote,
							func: 'formatQuote',
							className: 'redactor_format_blockquote'
						},
						code:
						{
							title: lang.code,
							func: 'formatBlocks',
							className: 'redactor_format_code'
						},
						h1:
						{
							title: lang.header1,
							func: 'formatBlocks',
							className: 'redactor_format_h1'
						},
						h2:
						{
							title: lang.header2,
							func: 'formatBlocks',
							className: 'redactor_format_h2'
						},
						h3:
						{
							title: lang.header3,
							func: 'formatBlocks',
							className: 'redactor_format_h3'
						},
						h4:
						{
							title: lang.header4,
							func: 'formatBlocks',
							className: 'redactor_format_h4'
						},
						h5:
						{
							title: lang.header5,
							func: 'formatBlocks',
							className: 'redactor_format_h5'
						}
					}
				},
				bold:
				{
					title: lang.bold,
					exec: 'bold'
				},
				italic:
				{
					title: lang.italic,
					exec: 'italic'
				},
				deleted:
				{
					title: lang.deleted,
					exec: 'strikethrough'
				},
				underline:
				{
					title: lang.underline,
					exec: 'underline'
				},
				unorderedlist:
				{
					title: '&bull; ' + lang.unorderedlist,
					exec: 'insertunorderedlist'
				},
				orderedlist:
				{
					title: '1. ' + lang.orderedlist,
					exec: 'insertorderedlist'
				},
				outdent:
				{
					title: '< ' + lang.outdent,
					func: 'indentingOutdent'
				},
				indent:
				{
					title: '> ' + lang.indent,
					func: 'indentingIndent'
				},
				image:
				{
					title: lang.image,
					func: 'imageShow'
				},
				video:
				{
					title: lang.video,
					func: 'videoShow'
				},
				file:
				{
					title: lang.file,
					func: 'fileShow'
				},
				table:
				{
					title: lang.table,
					func: 'show',
					dropdown:
					{
						insert_table:
						{
							title: lang.insert_table,
							func: 'tableShow'
						},
						separator_drop1:
						{
							name: 'separator'
						},
						insert_row_above:
						{
							title: lang.insert_row_above,
							func: 'tableAddRowAbove'
						},
						insert_row_below:
						{
							title: lang.insert_row_below,
							func: 'tableAddRowBelow'
						},
						insert_column_left:
						{
							title: lang.insert_column_left,
							func: 'tableAddColumnLeft'
						},
						insert_column_right:
						{
							title: lang.insert_column_right,
							func: 'tableAddColumnRight'
						},
						separator_drop2:
						{
							name: 'separator'
						},
						add_head:
						{
							title: lang.add_head,
							func: 'tableAddHead'
						},
						delete_head:
						{
							title: lang.delete_head,
							func: 'tableDeleteHead'
						},
						separator_drop3:
						{
							name: 'separator'
						},
						delete_column:
						{
							title: lang.delete_column,
							func: 'tableDeleteColumn'
						},
						delete_row:
						{
							title: lang.delete_row,
							func: 'tableDeleteRow'
						},
						delete_table:
						{
							title: lang.delete_table,
							func: 'tableDeleteTable'
						}
					}
				},
				link: {
					title: lang.link,
					func: 'show',
					dropdown:
					{
						link:
						{
							title: lang.link_insert,
							func: 'linkShow'
						},
						unlink:
						{
							title: lang.unlink,
							exec: 'unlink'
						}
					}
				},
				alignment:
				{
					title: lang.alignment,
					func: 'show',
					dropdown:
					{
						alignleft:
						{
							title: lang.align_left,
							func: 'alignmentLeft'
						},
						aligncenter:
						{
							title: lang.align_center,
							func: 'alignmentCenter'
						},
						alignright:
						{
							title: lang.align_right,
							func: 'alignmentRight'
						},
						justify:
						{
							title: lang.align_justify,
							func: 'alignmentJustify'
						}
					}
				},
				alignleft:
				{
					title: lang.align_left,
					func: 'alignmentLeft'
				},
				aligncenter:
				{
					title: lang.align_center,
					func: 'alignmentCenter'
				},
				alignright:
				{
					title: lang.align_right,
					func: 'alignmentRight'
				},
				alignjustify:
				{
					title: lang.align_justify,
					func: 'alignmentJustify'
				},
				horizontalrule:
				{
					exec: 'inserthorizontalrule',
					title: lang.horizontalrule
				}

			}
		},

		callback: function(type, event, data)
		{
			var callback = this.opts[ type + 'Callback' ];
			if ($.isFunction(callback))
			{
				if (event === false) return callback.call(this, data);
				else return callback.call(this, event, data);
			}
			else return data;
		},

		destroy: function()
		{
			clearInterval(this.autosaveInterval);

			$(window).off('.redactor');
			this.$source.off('redactor-textarea');
			this.$element.off('.redactor').removeData('redactor');

			var html = this.get();

			if (this.opts.textareamode)
			{
				this.$box.after(this.$source);
				this.$box.remove();
				this.$source.val(html).show();
			}
			else
			{
				var $elem = this.$editor;
				if (this.opts.iframe) $elem = this.$element;

				this.$box.after($elem);
				this.$box.remove();

				$elem.removeClass('redactor_editor').removeClass('redactor_editor_wym').removeAttr('contenteditable').html(html).show();
			}

			if (this.opts.toolbarExternal)
			{
				$(this.opts.toolbarExternal).html('');
			}

			if (this.opts.air)
			{
				$('#redactor_air_' + this.uuid).remove();
			}
		},

		getObject: function()
		{
			return $.extend({}, this);
		},
		getEditor: function()
		{
			return this.$editor;
		},
		getBox: function()
		{
			return this.$box;
		},
		getIframe: function()
		{
			return (this.opts.iframe) ? this.$frame : false;
		},
		getToolbar: function()
		{
			return (this.$toolbar) ? this.$toolbar : false;
		},

		get: function()
		{
			return this.$source.val();
		},
		getCodeIframe: function()
		{
			this.$editor.removeAttr('contenteditable').removeAttr('dir');
			var html = this.outerHtml(this.$frame.contents().children());
			this.$editor.attr({ 'contenteditable': true, 'dir': this.opts.direction });

			return html;
		},
		set: function(html, strip, placeholderRemove)
		{
			html = html.toString();
			html = html.replace(/\$/g, '&#36;');

			if (this.opts.fullpage) this.setCodeIframe(html);
			else this.setEditor(html, strip);

			if (html == '') placeholderRemove = false;
			if (placeholderRemove !== false) this.placeholderRemoveFromEditor();
		},
		setEditor: function(html, strip)
		{

            html = this.sanitizeHTML(html);

			if (strip !== false)
			{
				html = this.cleanSavePreCode(html);

				html = this.cleanStripTags(html);
				html = this.cleanConvertProtected(html);
				html = this.cleanConvertInlineTags(html, true);

				if (this.opts.linebreaks === false)	html = this.cleanConverters(html);
				else html = html.replace(/<p(.*?)>([\w\W]*?)<\/p>/gi, '$2<br>');
			}

			html = html.replace(/&amp;#36;/g, '$');
            html = this.cleanEmpty(html);

			this.$editor.html(html);

			this.setNonEditable();
			this.setSpansVerified();

			this.sync();
		},
        sanitizeHTML:  function(htmlStr)
		{
            if(htmlStr.length === 0){
                return htmlStr;
            }
            function stringToHTML () {
                let parser = new DOMParser();
                let doc = parser.parseFromString(htmlStr, 'text/html');
                return doc.body;
            }
            function clean (html) {
                let nodes = html.children;
                for (let node of nodes) {
                    removeAttributes(node);
                    clean(node);
                }
            }
            function removeAttributes (elem) {
                let atts = elem.attributes;
                for (let {name, value} of atts) {
                    if (!isPossiblyDangerous(name, value)) { continue };
                    elem.removeAttribute(name);
                }

            }
            function isPossiblyDangerous (name, value) {
                let val = value.replace(/\s+/g, '').toLowerCase();
                if (['src', 'href', 'xlink:href'].includes(name)) {
                    if (val.includes('javascript:') || val.includes('data:text/html')) { return true; }
                }
                if (name.startsWith('on')) { return true; }
            }
            let html = stringToHTML();

            clean(html);

            return html.innerHTML;
        },
		setCodeIframe: function(html)
		{
			var doc = this.iframePage();
			this.$frame[0].src = "about:blank";

			html = this.cleanConvertProtected(html);
			html = this.cleanConvertInlineTags(html);
			html = this.cleanRemoveSpaces(html);

			doc.open();
			doc.write(html);
			doc.close();

			if (this.opts.fullpage)
			{
				this.$editor = this.$frame.contents().find('body').attr({ 'contenteditable': true, 'dir': this.opts.direction });
			}

			this.setNonEditable();
			this.setSpansVerified();
			this.sync();

		},
		setFullpageOnInit: function(html)
		{
            html = this.sanitizeHTML(html);
			this.fullpageDoctype = html.match(/^<\!doctype[^>]*>/i);
			if (this.fullpageDoctype && this.fullpageDoctype.length == 1)
			{
				html = html.replace(/^<\!doctype[^>]*>/i, '');
			}

			html = this.cleanSavePreCode(html, true);
			html = this.cleanConverters(html);
			html = this.cleanEmpty(html);

			this.$editor.html(html);

			this.setNonEditable();
			this.setSpansVerified();
			this.sync();
		},
		setFullpageDoctype: function()
		{
			if (this.fullpageDoctype && this.fullpageDoctype.length == 1)
			{
				var source = this.fullpageDoctype[0] + '\n' + this.$source.val();
				this.$source.val(source);
			}
		},
		setSpansVerified: function()
		{
			var spans = this.$editor.find('span');
			var replacementTag = 'inline';

			$.each(spans, function() {
				var outer = this.outerHTML;

				var regex = new RegExp('<' + this.tagName, 'gi');
				var newTag = outer.replace(regex, '<' + replacementTag);

				regex = new RegExp('</' + this.tagName, 'gi');
				newTag = newTag.replace(regex, '</' + replacementTag);

				$(this).replaceWith(newTag);
			});

		},
		setSpansVerifiedHtml: function(html)
		{
			html = html.replace(/<span(.*?)>/, '<inline$1>');
			return html.replace(/<\/span>/, '</inline>');
		},
		setNonEditable: function()
		{
			this.$editor.find('.noneditable').attr('contenteditable', false);
		},

		sync: function(e)
		{
			var html = '';

			this.cleanUnverified();

			if (this.opts.fullpage) html = this.getCodeIframe();
			else html = this.$editor.html();

			html = this.syncClean(html);
			html = this.cleanRemoveEmptyTags(html);

			var source = this.cleanRemoveSpaces(this.$source.val(), false);
			var editor = this.cleanRemoveSpaces(html, false);

			if (source == editor)
			{

				return false;
			}

			html = html.replace(/<\/li><(ul|ol)>([\w\W]*?)<\/(ul|ol)>/gi, '<$1>$2</$1></li>');

			if ($.trim(html) === '<br>') html = '';
			if (this.opts.xhtml)
			{
				var xhtmlTags = ['br', 'hr', 'img', 'link', 'input', 'meta'];
				$.each(xhtmlTags, function(i,s)
				{
					html = html.replace(new RegExp('<' + s + '(.*?[^\/$]?)>', 'gi'), '<' + s + '$1 />');
				});

			}
			html = this.callback('syncBefore', false, html);

			this.$source.val(html);
			this.setFullpageDoctype();
			this.callback('syncAfter', false, html);

			if (this.start === false)
			{

				if (typeof e != 'undefined')
				{
					switch(e.which)
					{
				        case 37:
				        break;
				        case 38:
				        break;
				        case 39:
				        break;
				        case 40:
				        break;

						default: this.callback('change', false, html);
					}
				}
				else
				{
					this.callback('change', false, html);
				}
			}

		},
		syncClean: function(html)
		{
			if (!this.opts.fullpage) html = this.cleanStripTags(html);
			html = $.trim(html);
			html = this.placeholderRemoveFromCode(html);
			html = html.replace(/&#x200b;/gi, '');
			html = html.replace(/&#8203;/gi, '');
			html = html.replace(/<\/a>&nbsp;/gi, '<\/a> ');
			html = html.replace(/\u200B/g, '');

			if (html == '<p></p>' || html == '<p> </p>' || html == '<p>&nbsp;</p>')
			{
				html = '';
			}
			if (this.opts.linkNofollow)
			{
				html = html.replace(/<a(.*?)rel="nofollow"(.*?)>/gi, '<a$1$2>');
				html = html.replace(/<a(.*?)>/gi, '<a$1 rel="nofollow">');
			}
			html = html.replace('<!--?php', '<?php');
			html = html.replace('?-->', '?>');
			html = html.replace(/<(.*?)class="noeditable"(.*?) contenteditable="false"(.*?)>/gi, '<$1class="noeditable"$2$3>');

			html = html.replace(/ data-tagblock=""/gi, '');
			html = html.replace(/<br\s?\/?>\n?<\/(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)>/gi, '</$1>');
			html = html.replace(/<span(.*?)id="redactor-image-box"(.*?)>([\w\W]*?)<img(.*?)><\/span>/gi, '$3<img$4>');
			html = html.replace(/<span(.*?)id="redactor-image-resizer"(.*?)>(.*?)<\/span>/gi, '');
			html = html.replace(/<span(.*?)id="redactor-image-editter"(.*?)>(.*?)<\/span>/gi, '');
			html = html.replace(/<(ul|ol)>\s*\t*\n*<\/(ul|ol)>/gi, '');
			if (this.opts.cleanFontTag)
			{
				html = html.replace(/<font(.*?)>([\w\W]*?)<\/font>/gi, '$2');
			}
			html = html.replace(/<span(.*?)>([\w\W]*?)<\/span>/gi, '$2');
			html = html.replace(/<inline>([\w\W]*?)<\/inline>/gi, '$1');
			html = html.replace(/<inline>/gi, '<span>');
			html = html.replace(/<inline /gi, '<span ');
			html = html.replace(/<\/inline>/gi, '</span>');

			if (this.opts.removeEmptyTags)
			{
				html = html.replace(/<span>([\w\W]*?)<\/span>/gi, '$1');
			}

			html = html.replace(/<span(.*?)class="redactor_placeholder"(.*?)>([\w\W]*?)<\/span>/gi, '');
			html = html.replace(/<img(.*?)contenteditable="false"(.*?)>/gi, '<img$1$2>');
			html = html.replace(/&/gi, '&');
			html = html.replace(/\u2122/gi, '&trade;');
			html = html.replace(/\u00a9/gi, '&copy;');
			html = html.replace(/\u2026/gi, '&hellip;');
			html = html.replace(/\u2014/gi, '&mdash;');
			html = html.replace(/\u2010/gi, '&dash;');

			html = this.cleanReConvertProtected(html);

			return html;
		},

		buildStart: function()
		{

			this.content = '';
			this.$box = $('<div class="redactor_box" />');
			if (this.$source[0].tagName === 'TEXTAREA') this.opts.textareamode = true;
			if (this.opts.mobile === false && this.isMobile())
			{
				this.buildMobile();
			}
			else
			{

				this.buildContent();

				if (this.opts.iframe)
				{

					this.opts.autoresize = false;
					this.iframeStart();
				}
				else if (this.opts.textareamode) this.buildFromTextarea();
				else this.buildFromElement();
				if (!this.opts.iframe)
				{
					this.buildOptions();
					this.buildAfter();
				}
			}
		},
		buildMobile: function()
		{
			if (!this.opts.textareamode)
			{
				this.$editor = this.$source;
				this.$editor.hide();
				this.$source = this.buildCodearea(this.$editor);
				this.$source.val(this.content);
			}

			this.$box.insertAfter(this.$source).append(this.$source);
		},
		buildContent: function()
		{
			if (this.opts.textareamode) this.content = $.trim(this.$source.val());
			else this.content = $.trim(this.$source.html());
		},
		buildFromTextarea: function()
		{
			this.$editor = $('<div />');
			this.$box.insertAfter(this.$source).append(this.$editor).append(this.$source);
			this.buildAddClasses(this.$editor);
			this.buildEnable();
		},
		buildFromElement: function()
		{
			this.$editor = this.$source;
			this.$source = this.buildCodearea(this.$editor);
			this.$box.insertAfter(this.$editor).append(this.$editor).append(this.$source);
			this.buildEnable();
		},
		buildCodearea: function($source)
		{
			return $('<textarea />').attr('name', $source.attr('id')).css('height', this.sourceHeight);
		},
		buildAddClasses: function(el)
		{

			$.each(this.$source.get(0).className.split(/\s+/), function(i,s)
			{
				el.addClass('redactor_' + s);
			});
		},
		buildEnable: function()
		{
			this.$editor.addClass('redactor_editor').attr({ 'contenteditable': true, 'dir': this.opts.direction });
			this.$source.attr('dir', this.opts.direction).hide();
			this.set(this.content, true, false);
		},
		buildOptions: function()
		{
			var $source = this.$editor;
			if (this.opts.iframe) $source = this.$frame;
			if (this.opts.tabindex) $source.attr('tabindex', this.opts.tabindex);

			if (this.opts.minHeight) $source.css('min-height', this.opts.minHeight + 'px');

			else if (this.browser('mozilla') && this.opts.linebreaks)
			{
				this.$editor.css('min-height', '45px');
			}

			if (this.browser('mozilla') && this.opts.linebreaks)
			{
				this.$editor.css('padding-bottom', '10px');
			}
			if (this.opts.maxHeight)
			{
				this.opts.autoresize = false;
				this.sourceHeight = this.opts.maxHeight;
			}
			if (this.opts.wym) this.$editor.addClass('redactor_editor_wym');
			if (this.opts.typewriter) this.$editor.addClass('redactor-editor-typewriter');
			if (!this.opts.autoresize) $source.css('height', this.sourceHeight);

		},
		buildAfter: function()
		{
			this.start = false;
			if (this.opts.toolbar)
			{
				this.opts.toolbar = this.toolbarInit(this.opts.curLang);
				this.toolbarBuild();
			}
			this.modalTemplatesInit();
			this.buildPlugins();
			this.buildBindKeyboard();
			if (this.opts.autosave) this.autosave();
			setTimeout($.proxy(this.observeStart, this), 4);
			if (this.browser('mozilla'))
			{
				try {
					this.document.execCommand('enableObjectResizing', false, false);
					this.document.execCommand('enableInlineTableEditing', false, false);
				} catch (e) {}
			}
			if (this.opts.focus) setTimeout($.proxy(this.focus, this), 100);
			if (!this.opts.visual)
			{
				setTimeout($.proxy(function()
				{
					this.opts.visual = true;
					this.toggle(false);

				}, this), 200);
			}
			this.callback('init');
		},
		buildBindKeyboard: function()
		{
			this.dblEnter = 0;

			if (this.opts.dragUpload && (this.opts.imageUpload !== false || this.opts.s3 !== false))
			{
				this.$editor.on('drop.redactor', $.proxy(this.buildEventDrop, this));
			}

			this.$editor.on('click.redactor', $.proxy(function()
			{
				this.selectall = false;

			}, this));

			this.$editor.on('input.redactor', $.proxy(this.sync, this));
			this.$editor.on('paste.redactor', $.proxy(this.buildEventPaste, this));
			this.$editor.on('keydown.redactor', $.proxy(this.buildEventKeydown, this));
			this.$editor.on('keyup.redactor', $.proxy(this.buildEventKeyup, this));
			if ($.isFunction(this.opts.textareaKeydownCallback))
			{
				this.$source.on('keydown.redactor-textarea', $.proxy(this.opts.textareaKeydownCallback, this));
			}
			if ($.isFunction(this.opts.focusCallback))
			{
				this.$editor.on('focus.redactor', $.proxy(this.opts.focusCallback, this));
			}

			var clickedElement;
			$(document).mousedown(function(e) {
				clickedElement = $(e.target);
			});
			this.$editor.on('blur.redactor', $.proxy(function(e)
			{
				if (!$(clickedElement).hasClass('redactor_toolbar') && $(clickedElement).parents('.redactor_toolbar').length == 0)
				{
					this.selectall = false;
					if ($.isFunction(this.opts.blurCallback)) this.callback('blur', e);
				}
			}, this));

		},
		buildEventDrop: function(e)
		{
			e = e.originalEvent || e;

			if (window.FormData === undefined || !e.dataTransfer) return true;

		    var length = e.dataTransfer.files.length;
		    if (length == 0) return true;

		    e.preventDefault();

	        var file = e.dataTransfer.files[0];

	        if (this.opts.dnbImageTypes !== false && this.opts.dnbImageTypes.indexOf(file.type) == -1)
	        {
		        return true;
	        }

			this.bufferSet();

			this.showProgressBar();

			if (this.opts.s3 === false)
			{
				this.dragUploadAjax(this.opts.imageUpload, file, true, e, this.opts.imageUploadParam);
			}
			else
			{
				this.s3uploadFile(file);
			}
		},
		buildEventPaste: function(e)
		{
			var oldsafari = false;
			if (this.browser('webkit') && navigator.userAgent.indexOf('Chrome') === -1)
			{
				var arr = this.browser('version').split('.');
				if (arr[0] < 536) oldsafari = true;
			}

			if (oldsafari) return true;
			if (this.browser('opera')) return true;
			if (this.opts.clipboardUpload && this.buildEventClipboardUpload(e)) return true;

			if (this.opts.cleanup)
			{
				this.rtePaste = true;

				this.selectionSave();

				if (!this.selectall)
				{
					if (this.opts.autoresize === true && this.fullscreen !== true)
					{
						this.$editor.height(this.$editor.height());
						this.saveScroll = this.document.body.scrollTop;
					}
					else
					{
						this.saveScroll = this.$editor.scrollTop();
					}
				}

				var frag = this.extractContent();

				setTimeout($.proxy(function()
				{
					var pastedFrag = this.extractContent();
					this.$editor.append(frag);

					this.selectionRestore();

					var html = this.getFragmentHtml(pastedFrag);
					this.pasteClean(html);

					if (this.opts.autoresize === true && this.fullscreen !== true) this.$editor.css('height', 'auto');

				}, this), 1);
			}
		},
		buildEventClipboardUpload: function(e)
		{
			var event = e.originalEvent || e;
			this.clipboardFilePaste = false;
			if (typeof(event.clipboardData) === 'undefined') { return false; }
            var clipboard = event.clipboardData;
			if (clipboard.items)
			{
				var file = event.clipboardData.items[0].getAsFile();
				if (file !== null)
				{
					this.bufferSet();
					this.clipboardFilePaste = true;

					var reader = new FileReader();
					reader.onload = $.proxy(this.pasteClipboardUpload, this);
			        reader.readAsDataURL(file);

			        return true;
				}
			}

			return false;

		},
		buildEventKeydown: function(e)
		{
			if (this.rtePaste) return false;

			var key = e.which;
			var ctrl = e.ctrlKey || e.metaKey;
			var parent = this.getParent();
			var current = this.getCurrent();
			var block = this.getBlock();
			var pre = false;

			this.callback('keydown', e);

			/*
				firefox cmd+left/Cmd+right browser back/forward fix -
				http://joshrhoderick.wordpress.com/2010/05/05/how-firefoxs-command-key-bug-kills-usability-on-the-mac/
			*/
			if (this.browser('mozilla') && "modify" in window.getSelection())
			{
				if ((ctrl) && (e.keyCode===37 || e.keyCode===39))
				{
					var selection = this.getSelection();
					var lineOrWord = (e.metaKey ? "line" : "word");
					if (e.keyCode===37)
					{
						selection.modify("extend","left",lineOrWord);
						if (!e.shiftKey)
						{
							selection.collapseToStart();
						}
					}
					if (e.keyCode===39)
					{
						selection.modify("extend","right",lineOrWord);
						if (!e.shiftKey)
						{
							selection.collapseToEnd();
						}
					}

					e.preventDefault();
				}
			}
			this.imageResizeHide(false);
			if ((parent && $(parent).get(0).tagName === 'CODE') || (current && $(current).get(0).tagName === 'CODE'))
			{
				pre = true;
				if (key === this.keyCode.DOWN) this.insertAfterLastElement(block);
			}
			if (key === this.keyCode.DOWN)
			{
				if (parent && $(parent)[0].tagName === 'BLOCKQUOTE') this.insertAfterLastElement(parent);
				if (current && $(current)[0].tagName === 'BLOCKQUOTE') this.insertAfterLastElement(current);

				if (parent && $(parent)[0].tagName === 'P' && $(parent).parent()[0].tagName == 'BLOCKQUOTE')
				{
					this.insertAfterLastElement(parent, $(parent).parent()[0]);
				}
				if (current && $(current)[0].tagName === 'P' && parent && $(parent)[0].tagName == 'BLOCKQUOTE')
				{
					this.insertAfterLastElement(current, parent);
				}
			}
			this.shortcuts(e, key);
			if (ctrl && key === 90 && !e.shiftKey && !e.altKey)
			{
				e.preventDefault();
				if (this.opts.buffer.length) this.bufferUndo();
				else this.document.execCommand('undo', false, false);
				return;
			}

			else if (ctrl && key === 90 && e.shiftKey && !e.altKey)
			{
				e.preventDefault();
				if (this.opts.rebuffer.length != 0) this.bufferRedo();
				else this.document.execCommand('redo', false, false);
				return;
			}
			if (key == 32)
			{
				this.bufferSet();
			}
			if (ctrl && key === 65)
			{
				this.bufferSet();
				this.selectall = true;
			}
			else if (key != this.keyCode.LEFT_WIN && !ctrl)
			{
				this.selectall = false;
			}
			if (key == this.keyCode.ENTER && !e.shiftKey && !e.ctrlKey && !e.metaKey)
			{

				var range = this.getRange();
				if (range && range.collapsed === false)
				{
					sel = this.getSelection();
					if (sel.rangeCount)
					{
						range.deleteContents();
					}
				}
				if (this.browser('msie') && (parent.nodeType == 1 && (parent.tagName == 'TD' || parent.tagName == 'TH')))
				{
					e.preventDefault();
					this.bufferSet();
					this.insertNode(document.createElement('br'));
					this.callback('enter', e);
					return false;
				}
				if (block && (block.tagName == 'BLOCKQUOTE' || $(block).parent()[0].tagName == 'BLOCKQUOTE'))
				{
					if (this.isEndOfElement())
					{
						if (this.dblEnter == 1)
						{
							var element;
							var last;
							if (block.tagName == 'BLOCKQUOTE')
							{
								last = 'br';
								element = block;
							}
							else
							{
								last = 'p';
								element = $(block).parent()[0];
							}

							e.preventDefault();
							this.insertingAfterLastElement(element);
							this.dblEnter = 0;

							if (last == 'p')
							{
								$(block).parent().find('p').last().remove();
							}
							else
							{
								var tmp = $.trim($(block).html());
								$(block).html(tmp.replace(/<br\s?\/?>$/i, ''));
							}

							return;
						}
						else this.dblEnter++;
					}
					else this.dblEnter++;
				}
				if (pre === true)
				{
					return this.buildEventKeydownPre(e, current);
				}
				else
				{
					if (!this.opts.linebreaks)
					{

						if (block && block.tagName == 'LI')
						{
							var listCurrent = this.getBlock();
							if (listCurrent !== false || listCurrent.tagName === 'LI')
							{
								var listText = $.trim($(block).text());
								var listCurrentText = $.trim($(listCurrent).text());
								if (listText == ''
									&& listCurrentText == ''
									&& $(listCurrent).next('li').length == 0
									&& $(listCurrent).parents('li').length == 0)
								{
									this.bufferSet();

									var $list = $(listCurrent).closest('ol, ul');
									$(listCurrent).remove();
									var node = $('<p>' + this.opts.invisibleSpace + '</p>');
									$list.after(node);
									this.selectionStart(node);

									this.sync();
									this.callback('enter', e);
									return false;
								}
							}

						}
						if (block && this.opts.rBlockTest.test(block.tagName))
						{

							this.bufferSet();

							setTimeout($.proxy(function()
							{
								var blockElem = this.getBlock();
								if (blockElem.tagName === 'DIV' && !$(blockElem).hasClass('redactor_editor'))
								{
									var node = $('<p>' + this.opts.invisibleSpace + '</p>');
									$(blockElem).replaceWith(node);
									this.selectionStart(node);
								}

							}, this), 1);
						}
						else if (block === false)
						{

							this.bufferSet();
							var node = $('<p>' + this.opts.invisibleSpace + '</p>');
							this.insertNode(node[0]);
							this.selectionStart(node);
							this.callback('enter', e);
							return false;
						}

					}

					if (this.opts.linebreaks)
					{

						if (block && this.opts.rBlockTest.test(block.tagName))
						{

							this.bufferSet();

							setTimeout($.proxy(function()
							{
								var blockElem = this.getBlock();
								if ((blockElem.tagName === 'DIV' || blockElem.tagName === 'P') && !$(blockElem).hasClass('redactor_editor'))
								{
									this.replaceLineBreak(blockElem);
								}

							}, this), 1);
						}
						else
						{
							return this.buildEventKeydownInsertLineBreak(e);
						}
					}
					if (block.tagName == 'BLOCKQUOTE' || block.tagName == 'FIGCAPTION')
					{
						return this.buildEventKeydownInsertLineBreak(e);
					}

				}

				this.callback('enter', e);
			}
			else if (key === this.keyCode.ENTER && (e.ctrlKey || e.shiftKey))
			{
				this.bufferSet();

				e.preventDefault();
				this.insertLineBreak();
			}
			if ((key === this.keyCode.TAB || e.metaKey && key === 219) && this.opts.shortcuts)
			{
				return this.buildEventKeydownTab(e, pre, key);
			}
			if (key === this.keyCode.BACKSPACE) this.buildEventKeydownBackspace(e, current, parent);

		},
		buildEventKeydownPre: function(e, current)
		{
			e.preventDefault();
			this.bufferSet();
			var html = $(current).parent().text();
			this.insertNode(document.createTextNode('\n'));
			if (html.search(/\s$/) == -1)
			{
				this.insertNode(document.createTextNode('\n'));
			}

			this.sync();
			this.callback('enter', e);
			return false;
		},
		buildEventKeydownTab: function(e, pre, key)
		{
			if (!this.opts.tabFocus) return true;
			if (this.isEmpty(this.get()) && this.opts.tabSpaces === false) return true;

			e.preventDefault();

			if (pre === true && !e.shiftKey)
			{
				this.bufferSet();
				this.insertNode(document.createTextNode('\t'));
				this.sync();
				return false;

			}
			else if (this.opts.tabSpaces !== false)
			{
				this.bufferSet();
				this.insertNode(document.createTextNode(Array(this.opts.tabSpaces + 1).join('\u00a0')));
				this.sync();
				return false;
			}
			else
			{
				if (!e.shiftKey) this.indentingIndent();
				else this.indentingOutdent();
			}

			return false;
		},
		buildEventKeydownBackspace: function(e, current, parent)
		{

			if (parent && current && parent.parentNode.tagName == 'TD'
				&& parent.tagName == 'UL' && current.tagName == 'LI' && $(parent).children('li').length == 1)
			{
				var text = $(current).text().replace(/[\u200B-\u200D\uFEFF]/g, '');
				if (text == '')
				{
					var node = parent.parentNode;
					$(parent).remove();
					this.selectionStart(node);
					this.sync();
					return false;
				}
			}

			if (typeof current.tagName !== 'undefined' && /^(H[1-6])$/i.test(current.tagName))
			{
				var node;
				if (this.opts.linebreaks === false) node = $('<p>' + this.opts.invisibleSpace + '</p>');
				else node = $('<br>' + this.opts.invisibleSpace);

				$(current).replaceWith(node);
				this.selectionStart(node);
				this.sync();
			}

			if (typeof current.nodeValue !== 'undefined' && current.nodeValue !== null)
			{
				if (current.remove && current.nodeType === 3 && current.nodeValue.match(/[^\u200B]/g) == null)
				{
					$(current).prev().remove();
					this.sync();
				}
			}
		},
		buildEventKeydownInsertLineBreak: function(e)
		{
			this.bufferSet();
			e.preventDefault();
			this.insertLineBreak();
			this.callback('enter', e);
			return;
		},
		buildEventKeyup: function(e)
		{
			if (this.rtePaste) return false;

			var key = e.which;
			var parent = this.getParent();
			var current = this.getCurrent();
			if (!this.opts.linebreaks && current.nodeType == 3 && (parent == false || parent.tagName == 'BODY'))
			{
				var node = $('<p>').append($(current).clone());
				$(current).replaceWith(node);
				var next = $(node).next();
				if (typeof(next[0]) !== 'undefined' && next[0].tagName == 'BR')
				{
					next.remove();
				}

				this.selectionEnd(node);
			}
			if ((this.opts.convertLinks || this.opts.convertImageLinks || this.opts.convertVideoLinks) && key === this.keyCode.ENTER)
			{
				this.buildEventKeyupConverters();
			}
			if (key === this.keyCode.DELETE || key === this.keyCode.BACKSPACE)
			{
				return this.formatEmpty(e);
			}

			this.callback('keyup', e);
			this.sync(e);
		},
		buildEventKeyupConverters: function()
		{
			this.formatLinkify(this.opts.linkProtocol, this.opts.convertLinks, this.opts.convertImageLinks, this.opts.convertVideoLinks, this.opts.linkSize);

			setTimeout($.proxy(function()
			{
				if (this.opts.convertImageLinks) this.observeImages();
				if (this.opts.observeLinks) this.observeLinks();
			}, this), 5);
		},
		buildPlugins: function()
		{
			if (!this.opts.plugins ) return;

			$.each(this.opts.plugins, $.proxy(function(i, s)
			{
				if (RedactorPlugins[s])
				{
					$.extend(this, RedactorPlugins[s]);
					if ($.isFunction( RedactorPlugins[ s ].init)) this.init();
				}

			}, this ));
		},
		iframeStart: function()
		{
			this.iframeCreate();

			if (this.opts.textareamode) this.iframeAppend(this.$source);
			else
			{
				this.$sourceOld = this.$source.hide();
				this.$source = this.buildCodearea(this.$sourceOld);
				this.iframeAppend(this.$sourceOld);
			}
		},
		iframeAppend: function(el)
		{
			this.$source.attr('dir', this.opts.direction).hide();
			this.$box.insertAfter(el).append(this.$frame).append(this.$source);
		},
		iframeCreate: function()
		{
			this.$frame = $('<iframe style="width: 100%;" frameborder="0" />').one('load', $.proxy(function()
			{
				if (this.opts.fullpage)
				{
					this.iframePage();

					if (this.content === '') this.content = this.opts.invisibleSpace;

					this.$frame.contents()[0].write(this.content);
					this.$frame.contents()[0].close();

					var timer = setInterval($.proxy(function()
					{
						if (this.$frame.contents().find('body').html())
						{
							clearInterval(timer);
							this.iframeLoad();
						}

					}, this), 0);
				}
				else this.iframeLoad();

			}, this));
		},
		iframeDoc: function()
		{
			return this.$frame[0].contentWindow.document;
		},
		iframePage: function()
		{
			var doc = this.iframeDoc();
			if (doc.documentElement) doc.removeChild(doc.documentElement);

			return doc;
		},
		iframeAddCss: function(css)
		{
			css = css || this.opts.css;

			if (this.isString(css))
			{
				this.$frame.contents().find('head').append('<link rel="stylesheet" href="' + css + '" />');
			}

			if ($.isArray(css))
			{
				$.each(css, $.proxy(function(i, url)
				{
					this.iframeAddCss(url);

				}, this));
			}
		},
		iframeLoad: function()
		{
			this.$editor = this.$frame.contents().find('body').attr({ 'contenteditable': true, 'dir': this.opts.direction });
			if (this.$editor[0])
			{
				this.document = this.$editor[0].ownerDocument;
				this.window = this.document.defaultView || window;
			}
			this.iframeAddCss();

			if (this.opts.fullpage)
			{
				this.setFullpageOnInit(this.$source.val());
			}
			else this.set(this.content, true, false);

			this.buildOptions();
			this.buildAfter();
		},
		placeholderInit: function()
		{
			if (this.opts.placeholder !== false)
			{
				this.placeholderText = this.opts.placeholder;
				this.opts.placeholder = true;
			}
			else
			{
				if (typeof this.$element.attr('placeholder') == 'undefined' || this.$element.attr('placeholder') == '')
				{
					this.opts.placeholder = false;
				}
				else
				{
					this.placeholderText = this.$element.attr('placeholder');
					this.opts.placeholder = true;
				}
			}
		},
		placeholderStart: function(html)
		{
			if (this.opts.placeholder === false)
			{
				return false;
			}

			if (this.isEmpty(html))
			{
				this.opts.focus = false;
				this.placeholderOnFocus();
				this.placeholderOnBlur();

				return this.placeholderGet();
			}
			else
			{
				this.placeholderOnBlur();
			}

			return false;
		},
		placeholderOnFocus: function()
		{
			this.$editor.on('focus.redactor_placeholder', $.proxy(this.placeholderFocus, this));
		},
		placeholderOnBlur: function()
		{
			this.$editor.on('blur.redactor_placeholder', $.proxy(this.placeholderBlur, this));
		},
		placeholderGet: function()
		{
			var ph = $('<span class="redactor_placeholder">').data('redactor', 'verified')
			.attr('contenteditable', false).text(this.placeholderText);

			if (this.opts.linebreaks === false)
			{
				return $('<p>').append(ph);
			}
			else return ph;
		},
		placeholderBlur: function()
		{
			var html = this.get();
			if (this.isEmpty(html))
			{
				this.placeholderOnFocus();
				this.$editor.html(this.placeholderGet());
			}
		},
		placeholderFocus: function()
		{
			this.$editor.find('span.redactor_placeholder').remove();

			var html = '';
			if (this.opts.linebreaks === false)
			{
				html = this.opts.emptyHtml;
			}

			this.$editor.off('focus.redactor_placeholder');
			this.$editor.html(html);

			if (this.opts.linebreaks === false)
			{

				this.selectionStart(this.$editor.children()[0]);
			}
			else
			{
				this.focus();
			}

			this.sync();
		},
		placeholderRemoveFromEditor: function()
		{
			this.$editor.find('span.redactor_placeholder').remove();
			this.$editor.off('focus.redactor_placeholder');
		},
		placeholderRemoveFromCode: function(html)
		{
			return html.replace(/<span class="redactor_placeholder"(.*?)>(.*?)<\/span>/i, '');
		},
		shortcuts: function(e, key)
		{
			if (!this.opts.shortcuts)
			{
				if ((e.ctrlKey || e.metaKey) && (key === 66 || key === 73))
				{
					e.preventDefault();
				}

				return false;
			}

			$.each(this.opts.shortcuts, $.proxy(function(str, command)
			{
				var keys = str.split(',');
				for (var i in keys)
				{
					if (typeof keys[i] === 'string')
					{
						this.shortcutsHandler(e, $.trim(keys[i]), $.proxy(function()
						{
							eval(command);
						}, this));
					}

				}

			}, this));
		},
		shortcutsHandler: function(e, keys, origHandler)
		{

			var hotkeysSpecialKeys =
			{
				8: "backspace", 9: "tab", 10: "return", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
				20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
				37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 59: ";", 61: "=",
				96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
				104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
				112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
				120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 173: "-", 186: ";", 187: "=",
				188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'"
			};
			var hotkeysShiftNums =
			{
				"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
				"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
				".": ">",  "/": "?",  "\\": "|"
			};

			keys = keys.toLowerCase().split(" ");
			var special = hotkeysSpecialKeys[e.keyCode],
				character = String.fromCharCode( e.which ).toLowerCase(),
				modif = "", possible = {};

			$.each([ "alt", "ctrl", "meta", "shift"], function(index, specialKey)
			{
				if (e[specialKey + 'Key'] && special !== specialKey)
				{
					modif += specialKey + '+';
				}
			});
			if (special)
			{
				possible[modif + special] = true;
			}

			if (character)
			{
				possible[modif + character] = true;
				possible[modif + hotkeysShiftNums[character]] = true;

				if (modif === "shift+")
				{
					possible[hotkeysShiftNums[character]] = true;
				}
			}

			for (var i = 0, l = keys.length; i < l; i++)
			{
				if (possible[keys[i]])
				{
					e.preventDefault();
					return origHandler.apply(this, arguments);
				}
			}
		},
		focus: function()
		{
			if (!this.browser('opera'))
			{
				this.window.setTimeout($.proxy(this.focusSet, this, true), 1);
			}
			else
			{
				this.$editor.focus();
			}
		},
		focusWithSaveScroll: function()
		{
			if (this.browser('msie'))
			{
				var top = this.document.documentElement.scrollTop;
			}

			this.$editor.focus();

			if (this.browser('msie'))
			{
				this.document.documentElement.scrollTop = top;
			}
		},
		focusEnd: function()
		{
			if (!this.browser('mozilla'))
			{
				this.focusSet();
			}
			else
			{
				if (this.opts.linebreaks === false)
				{
					var last = this.$editor.children().last();

					this.$editor.focus();
					this.selectionEnd(last);
				}
				else
				{
					this.focusSet();
				}
			}
       	},
		focusSet: function(collapse, element)
		{
			this.$editor.focus();

			if (typeof element == 'undefined')
			{
				element = this.$editor[0];
			}

			var range = this.getRange();
			range.selectNodeContents(element);
			range.collapse(collapse || false);

			var sel = this.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		toggle: function(direct)
		{
			if (this.opts.visual) this.toggleCode(direct);
			else this.toggleVisual();
		},
		toggleVisual: function()
		{
			var html = this.$source.hide().val();
			if (typeof this.modified !== 'undefined')
			{
				var modified = this.modified.replace(/\n/g, '');

				var thtml = html.replace(/\n/g, '');
				thtml = this.cleanRemoveSpaces(thtml, false);

				this.modified = this.cleanRemoveSpaces(modified, false) !== thtml;
			}

			if (this.modified)
			{

				if (this.opts.fullpage && html === '')
				{
					this.setFullpageOnInit(html);
				}
				else
				{
					this.set(html);
					if (this.opts.fullpage)
					{
						this.buildBindKeyboard();
					}
				}

				this.callback('change', false, html);
			}

			if (this.opts.iframe) this.$frame.show();
			else this.$editor.show();

			if (this.opts.fullpage) this.$editor.attr('contenteditable', true );

			this.$source.off('keydown.redactor-textarea-indenting');

			this.$editor.focus();
			this.selectionRestore();

			this.observeStart();
			this.buttonActiveVisual();
			this.buttonInactive('html');
			this.opts.visual = true;
		},
		toggleCode: function(direct)
		{
			if (direct !== false) this.selectionSave();

			var height = null;
			if (this.opts.iframe)
			{
				height = this.$frame.height();
				if (this.opts.fullpage) this.$editor.removeAttr('contenteditable');
				this.$frame.hide();
			}
			else
			{
				height = this.$editor.innerHeight();
				this.$editor.hide();
			}

			var html = this.$source.val();
			if (html !== '' && this.opts.tidyHtml)
			{
				this.$source.val(this.cleanHtml(html));
			}

			this.modified = html;

			this.$source.height(height).show().focus();
			this.$source.on('keydown.redactor-textarea-indenting', this.textareaIndenting);

			this.buttonInactiveVisual();
			this.buttonActive('html');
			this.opts.visual = false;
		},
		textareaIndenting: function(e)
		{
			if (e.keyCode === 9)
			{
				var $el = $(this);
				var start = $el.get(0).selectionStart;
				$el.val($el.val().substring(0, start) + "\t" + $el.val().substring($el.get(0).selectionEnd));
				$el.get(0).selectionStart = $el.get(0).selectionEnd = start + 1;
				return false;
			}
		},
		autosave: function()
		{
			var savedHtml = false;
			this.autosaveInterval = setInterval($.proxy(function()
			{
				var html = this.get();
				if (savedHtml !== html)
				{
					var name = this.$source.attr('name');
					$.ajax({
						url: this.opts.autosave,
						type: 'post',
						data: 'name=' + name + '&' + name + '=' + escape(encodeURIComponent(html)),
						success: $.proxy(function(data)
						{
							var json = $.parseJSON(data);
							if (typeof json.error == 'undefined')
							{

								this.callback('autosave', false, json);
							}
							else
							{

								this.callback('autosaveError', false, json);
							}

							savedHtml = html;

						}, this)
					});
				}
			}, this), this.opts.autosaveInterval*1000);
		},
		toolbarBuild: function()
		{

			if (this.isMobile() && this.opts.buttonsHideOnMobile.length > 0)
			{
				$.each(this.opts.buttonsHideOnMobile, $.proxy(function(i, s)
				{
					var index = this.opts.buttons.indexOf(s);
					this.opts.buttons.splice(index, 1);

				}, this));
			}
			if (this.opts.air)
			{
				this.opts.buttons = this.opts.airButtons;
			}
			else
			{
				if (!this.opts.buttonSource)
				{
					var index = this.opts.buttons.indexOf('html');
					this.opts.buttons.splice(index, 1);
				}
			}
			if (this.opts.toolbar)
			{
				$.each(this.opts.toolbar.formatting.dropdown, $.proxy(function (i, s)
				{
					if ($.inArray(i, this.opts.formattingTags ) == '-1') delete this.opts.toolbar.formatting.dropdown[i];

				}, this));
			}
			if (this.opts.buttons.length === 0) return false;
			this.airEnable();
			this.$toolbar = $('<ul>').addClass('redactor_toolbar').attr('id', 'redactor_toolbar_' + this.uuid);

			if (this.opts.typewriter)
			{
				this.$toolbar.addClass('redactor-toolbar-typewriter');
			}

			if (this.opts.toolbarOverflow && this.isMobile())
			{
				this.$toolbar.addClass('redactor-toolbar-overflow');
			}

			if (this.opts.air)
			{

				this.$air = $('<div class="redactor_air">').attr('id', 'redactor_air_' + this.uuid).hide();
				this.$air.append(this.$toolbar);
				$('body').append(this.$air);
			}
			else
			{
				if (this.opts.toolbarExternal)
				{
					this.$toolbar.addClass('redactor-toolbar-external');
					$(this.opts.toolbarExternal).html(this.$toolbar);
				}
				else this.$box.prepend(this.$toolbar);
			}

			$.each(this.opts.buttons, $.proxy(function(i, btnName)
			{
				if (this.opts.toolbar[btnName])
				{
					var btnObject = this.opts.toolbar[btnName];
					if (this.opts.fileUpload === false && btnName === 'file') return true;
					this.$toolbar.append( $('<li>').append(this.buttonBuild(btnName, btnObject)));
				}

			}, this));

			this.$toolbar.find('a').attr('tabindex', '-1');
			if (this.opts.toolbarFixed)
			{
				this.toolbarObserveScroll();
				$(this.opts.toolbarFixedTarget).on('scroll.redactor', $.proxy(this.toolbarObserveScroll, this));
			}
			if (this.opts.activeButtons)
			{
				this.$editor.on('mouseup.redactor keyup.redactor', $.proxy(this.buttonActiveObserver, this));
			}
		},
		toolbarObserveScroll: function()
		{
			var scrollTop = $(this.opts.toolbarFixedTarget).scrollTop();

			var boxTop = 0;
			var left = 0;
			var end = 0;

			if (this.opts.toolbarFixedTarget === document)
			{
				boxTop = this.$box.offset().top;
			}
			else
			{
				boxTop = 1;
			}

			end = boxTop + this.$box.height() + 40;

			if (scrollTop > boxTop)
			{
				var width = '100%';
				if (this.opts.toolbarFixedBox)
				{
					left = this.$box.offset().left;
					width = this.$box.innerWidth();
					this.$toolbar.addClass('toolbar_fixed_box');
				}

				this.toolbarFixed = true;

				if (this.opts.toolbarFixedTarget === document)
				{
					this.$toolbar.css({
						position: 'fixed',
						width: width,
						zIndex: 10005,
						top: this.opts.toolbarFixedTopOffset + 'px',
						left: left
					});
				}
				else
				{
					this.$toolbar.css({
						position: 'absolute',
						width: width,
						zIndex: 10005,
						top: (this.opts.toolbarFixedTopOffset + scrollTop) + 'px',
						left: 0
					});
				}

				if (scrollTop < end) this.$toolbar.css('visibility', 'visible');
				else this.$toolbar.css('visibility', 'hidden');
			}
			else
			{
				this.toolbarFixed = false;
				this.$toolbar.css({
					position: 'relative',
					width: 'auto',
					top: 0,
					left: left
				});

				if (this.opts.toolbarFixedBox) this.$toolbar.removeClass('toolbar_fixed_box');
			}
		},
		airEnable: function()
		{
			if (!this.opts.air) return;

			this.$editor.on('mouseup.redactor keyup.redactor', this, $.proxy(function(e)
			{
				var text = this.getSelectionText();

				if (e.type === 'mouseup' && text != '') this.airShow(e);
				if (e.type === 'keyup' && e.shiftKey && text != '')
				{
					var $focusElem = $(this.getElement(this.getSelection().focusNode)), offset = $focusElem.offset();
					offset.height = $focusElem.height();
					this.airShow(offset, true);
				}

			}, this));
		},
		airShow: function (e, keyboard)
		{
			if (!this.opts.air) return;

			this.selectionSave();

			var left, top;
			$('.redactor_air').hide();

			if (keyboard)
			{
				left = e.left;
				top = e.top + e.height + 14;

				if (this.opts.iframe)
				{
					top += this.$box.position().top - $(this.document).scrollTop();
					left += this.$box.position().left;
				}
			}
			else
			{
				var width = this.$air.innerWidth();

				left = e.clientX;
				if ($(this.document).width() < (left + width)) left -= width;

				top = e.clientY + 14;
				if (this.opts.iframe)
				{
					top += this.$box.position().top;
					left += this.$box.position().left;
				}
				else top += $( this.document ).scrollTop();
			}

			this.$air.css({
				left: left + 'px',
				top: top + 'px'
			}).show();

			this.airBindHide();
		},
		airBindHide: function()
		{
			if (!this.opts.air) return;

			var hideHandler = $.proxy(function(doc)
			{
				$(doc).on('mousedown.redactor', $.proxy(function(e)
				{
					if ($( e.target ).closest(this.$toolbar).length === 0)
					{
						this.$air.fadeOut(100);
						this.selectionRemove();
						$(doc).off(e);
					}

				}, this)).on('keydown.redactor', $.proxy(function(e)
				{
					if (e.which === this.keyCode.ESC)
					{
						this.getSelection().collapseToStart();
					}

					this.$air.fadeOut(100);
					$(doc).off(e);

				}, this));
			}, this);
			hideHandler(document);
			if (this.opts.iframe) hideHandler(this.document);
		},
		airBindMousemoveHide: function()
		{
			if (!this.opts.air) return;

			var hideHandler = $.proxy(function(doc)
			{
				$(doc).on('mousemove.redactor', $.proxy(function(e)
				{
					if ($( e.target ).closest(this.$toolbar).length === 0)
					{
						this.$air.fadeOut(100);
						$(doc).off(e);
					}

				}, this));
			}, this);
			hideHandler(document);
			if (this.opts.iframe) hideHandler(this.document);
		},
		dropdownBuild: function($dropdown, dropdownObject)
		{
			$.each(dropdownObject, $.proxy(function(btnName, btnObject)
			{
				if (!btnObject.className) btnObject.className = '';

				var $item;
				if (btnObject.name === 'separator') $item = $('<a class="redactor_separator_drop">');
				else
				{
					$item = $('<a href="#" class="' + btnObject.className + ' redactor_dropdown_' + btnName + '">' + btnObject.title + '</a>');
					$item.on('click', $.proxy(function(e)
					{
						if (this.opts.air)
						{
							this.selectionRestore();
						}

						if (e.preventDefault) e.preventDefault();
						if (this.browser('msie')) e.returnValue = false;

						if (btnObject.callback) btnObject.callback.call(this, btnName, $item, btnObject, e);
						if (btnObject.exec) this.execCommand(btnObject.exec, btnName);
						if (btnObject.func) this[btnObject.func](btnName);

						this.buttonActiveObserver();
						if (this.opts.air) this.$air.fadeOut(100);
					}, this));
				}

				$dropdown.append($item);

			}, this));
		},
		dropdownShow: function(e, key)
		{
			if (!this.opts.visual)
			{
				e.preventDefault();
				return false;
			}

			var $button = this.buttonGet(key);
			var $dropdown  = $button.data('dropdown').appendTo(document.body);

			if ($button.hasClass('dropact')) this.dropdownHideAll();
			else
			{
				this.dropdownHideAll();
				this.callback('dropdownShow', { dropdown: $dropdown, key: key, button: $button });

				this.buttonActive(key);
				$button.addClass('dropact');

				var keyPosition = $button.offset();
				var dropdownWidth = $dropdown.width();
				if ((keyPosition.left + dropdownWidth) > $(document).width())
				{
					keyPosition.left -= dropdownWidth;
				}

				var left = keyPosition.left + 'px';
				var btnHeight = $button.innerHeight();

				var position = 'absolute';
				var top = (btnHeight + this.opts.toolbarFixedTopOffset) + 'px';

				if (this.opts.toolbarFixed && this.toolbarFixed) position = 'fixed';
				else top = keyPosition.top + btnHeight + 'px';

				$dropdown.css({ position: position, left: left, top: top }).show();
				this.callback('dropdownShown', { dropdown: $dropdown, key: key, button: $button });
			}
			var hdlHideDropDown = $.proxy(function(e)
			{
				this.dropdownHide(e, $dropdown);

			}, this);

			$(document).one('click', hdlHideDropDown);
			this.$editor.one('click', hdlHideDropDown);
			this.$editor.one('touchstart', hdlHideDropDown);
			e.stopPropagation();
			this.focusWithSaveScroll();
		},
		dropdownHideAll: function()
		{
			this.$toolbar.find('a.dropact').removeClass('redactor_act').removeClass('dropact');
			$('.redactor_dropdown').hide();
			this.callback('dropdownHide');
		},
		dropdownHide: function (e, $dropdown)
		{
			if (!$(e.target).hasClass('dropact'))
			{
				$dropdown.removeClass('dropact');
				this.dropdownHideAll();
			}
		},
		buttonBuild: function(btnName, btnObject, buttonImage)
		{
			var $button = $('<a href="javascript:;" title="' + btnObject.title + '" tabindex="-1" class="re-icon re-' + btnName + '"></a>');

			if (typeof buttonImage != 'undefined')
			{
				$button.addClass('redactor-btn-image');
			}

			$button.on('click', $.proxy(function(e)
			{
				if (e.preventDefault) e.preventDefault();
				if (this.browser('msie')) e.returnValue = false;

				if ($button.hasClass('redactor_button_disabled')) return false;

				if (this.isFocused() === false && !btnObject.exec)
				{
					this.focusWithSaveScroll();
				}

				if (btnObject.exec)
				{
					this.focusWithSaveScroll();

					this.execCommand(btnObject.exec, btnName);
					this.airBindMousemoveHide();

				}
				else if (btnObject.func && btnObject.func !== 'show')
				{
					this[btnObject.func](btnName);
					this.airBindMousemoveHide();

				}
				else if (btnObject.callback)
				{
					btnObject.callback.call(this, btnName, $button, btnObject, e);
					this.airBindMousemoveHide();

				}
				else if (btnObject.dropdown)
				{
					this.dropdownShow(e, btnName);
				}

				this.buttonActiveObserver(false, btnName);

			}, this));
			if (btnObject.dropdown)
			{
				var $dropdown = $('<div class="redactor_dropdown redactor_dropdown_box_' + btnName + '" style="display: none;">');
				$button.data('dropdown', $dropdown);
				this.dropdownBuild($dropdown, btnObject.dropdown);
			}

			return $button;
		},
		buttonGet: function(key)
		{
			if (!this.opts.toolbar) return false;
			return $(this.$toolbar.find('a.re-' + key));
		},
		buttonTagToActiveState: function(buttonName, tagName)
		{
			this.opts.activeButtons.push(buttonName);
			this.opts.activeButtonsStates[tagName] = buttonName;
		},
		buttonActiveToggle: function(key)
		{
			var btn = this.buttonGet(key);

			if (btn.hasClass('redactor_act'))
			{
				this.buttonInactive(key);
			}
			else
			{
				this.buttonActive(key);
			}
		},
		buttonActive: function(key)
		{
			var btn = this.buttonGet(key);
			btn.addClass('redactor_act');
		},
		buttonInactive: function(key)
		{
			var btn = this.buttonGet(key);
			btn.removeClass('redactor_act');
		},
		buttonInactiveAll: function(btnName)
		{
			this.$toolbar.find('a.re-icon').not('.re-' + btnName).removeClass('redactor_act');
		},
		buttonActiveVisual: function()
		{
			this.$toolbar.find('a.re-icon').not('a.re-html').removeClass('redactor_button_disabled');
		},
		buttonInactiveVisual: function()
		{
			this.$toolbar.find('a.re-icon').not('a.re-html').addClass('redactor_button_disabled');
		},
		buttonChangeIcon: function (key, classname)
		{
			this.buttonGet(key).addClass('re-' + classname);
		},
		buttonRemoveIcon: function(key, classname)
		{
			this.buttonGet(key).removeClass('re-' + classname);
		},
		buttonAwesome: function(key, name)
		{
			var button = this.buttonGet(key);
			button.removeClass('redactor-btn-image');
			button.addClass('fa-redactor-btn');
			button.html('<i class="fa ' + name + '"></i>');
		},
		buttonAdd: function(key, title, callback, dropdown)
		{
			if (!this.opts.toolbar) return;
			var btn = this.buttonBuild(key, { title: title, callback: callback, dropdown: dropdown }, true);

			this.$toolbar.append($('<li>').append(btn));

			return btn;
		},
		buttonAddFirst: function(key, title, callback, dropdown)
		{
			if (!this.opts.toolbar) return;
			var btn = this.buttonBuild(key, { title: title, callback: callback, dropdown: dropdown }, true);
			this.$toolbar.prepend($('<li>').append(btn));
		},
		buttonAddAfter: function(afterkey, key, title, callback, dropdown)
		{
			if (!this.opts.toolbar) return;
			var btn = this.buttonBuild(key, { title: title, callback: callback, dropdown: dropdown }, true);
			var $btn = this.buttonGet(afterkey);

			if ($btn.length !== 0) $btn.parent().after($('<li>').append(btn));
			else this.$toolbar.append($('<li>').append(btn));

			return btn;
		},
		buttonAddBefore: function(beforekey, key, title, callback, dropdown)
		{
			if (!this.opts.toolbar) return;
			var btn = this.buttonBuild(key, { title: title, callback: callback, dropdown: dropdown }, true);
			var $btn = this.buttonGet(beforekey);

			if ($btn.length !== 0) $btn.parent().before($('<li>').append(btn));
			else this.$toolbar.append($('<li>').append(btn));

			return btn;
		},
		buttonRemove: function (key)
		{
			var $btn = this.buttonGet(key);
			$btn.remove();
		},
		buttonActiveObserver: function(e, btnName)
		{
			var parent = this.getParent();
			this.buttonInactiveAll(btnName);

			if (e === false && btnName !== 'html')
			{
				if ($.inArray(btnName, this.opts.activeButtons) != -1)
				{
					this.buttonActiveToggle(btnName);
				}
				return;
			}

			if (parent && parent.tagName === 'A') this.$toolbar.find('a.redactor_dropdown_link').text(this.opts.curLang.link_edit);
			else this.$toolbar.find('a.redactor_dropdown_link').text(this.opts.curLang.link_insert);

			$.each(this.opts.activeButtonsStates, $.proxy(function(key, value)
			{
				if ($(parent).closest(key, this.$editor.get()[0]).length != 0)
				{
					this.buttonActive(value);
				}

			}, this));

			var $parent = $(parent).closest(this.opts.alignmentTags.toString().toLowerCase(), this.$editor[0]);
			if ($parent.length)
			{
				var align = $parent.css('text-align');
				if (align == '')
				{
					align = 'left';
				}

				this.buttonActive('align' + align);
			}
		},
		execPasteFrag: function(html)
		{
			var sel = this.getSelection();
			if (sel.getRangeAt && sel.rangeCount)
			{
				var range = this.getRange();
				range.deleteContents();

				var el = this.document.createElement("div");
				el.innerHTML = html;

				var frag = this.document.createDocumentFragment(), node, lastNode;
				while ((node = el.firstChild))
				{
					lastNode = frag.appendChild(node);
				}

				var firstNode = frag.firstChild;
				range.insertNode(frag);

				if (lastNode)
				{
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
				}
				sel.removeAllRanges();
				sel.addRange(range);
			}
		},
		exec: function(cmd, param, sync)
		{
			if (cmd === 'formatblock' && this.browser('msie'))
			{
				param = '<' + param + '>';
			}

			if (cmd === 'inserthtml' && this.browser('msie'))
			{
				if (!this.isIe11())
				{
					this.focusWithSaveScroll();
					this.document.selection.createRange().pasteHTML(param);
				}
				else this.execPasteFrag(param);
			}
			else
			{
				this.document.execCommand(cmd, false, param);
			}

			if (sync !== false) this.sync();
			this.callback('execCommand', cmd, param);
		},
		execCommand: function(cmd, param, sync)
		{
			if (!this.opts.visual)
			{
				this.$source.focus();
				return false;
			}

			if (   cmd === 'bold'
				|| cmd === 'italic'
				|| cmd === 'underline'
				|| cmd === 'strikethrough')
			{
				this.bufferSet();
			}
			if (cmd === 'superscript' || cmd === 'subscript')
			{
				var parent = this.getParent();
				if (parent.tagName === 'SUP' || parent.tagName === 'SUB')
				{
					this.inlineRemoveFormatReplace(parent);
				}
			}

			if (cmd === 'inserthtml')
			{
				this.insertHtml(param, sync);
				this.callback('execCommand', cmd, param);
				return;
			}
			if (this.currentOrParentIs('CODE') && !this.opts.formattingPre) return false;
			if (cmd === 'insertunorderedlist' || cmd === 'insertorderedlist') return this.execLists(cmd, param);
			if (cmd === 'unlink') return this.execUnlink(cmd, param);
			this.exec(cmd, param, sync);
			if (cmd === 'inserthorizontalrule') this.$editor.find('hr').removeAttr('id');

		},
		execUnlink: function(cmd, param)
		{
			this.bufferSet();

			var link = this.currentOrParentIs('A');
			if (link)
			{
				$(link).replaceWith($(link).text());

				this.sync();
				this.callback('execCommand', cmd, param);
				return;
			}
		},
		execLists: function(cmd, param)
		{
			this.bufferSet();

			var parent = this.getParent();
			var $list = $(parent).closest('ol, ul');

			if (!this.isParentRedactor($list) && $list.length != 0)
			{
				$list = false;
			}

			var remove = false;

			if ($list && $list.length)
			{
				remove = true;
				var listTag = $list[0].tagName;
			 	if ((cmd === 'insertunorderedlist' && listTag === 'OL')
			 	|| (cmd === 'insertorderedlist' && listTag === 'UL'))
			 	{
				 	remove = false;
				}
			}

			this.selectionSave();
			if (remove)
			{

				var nodes = this.getNodes();
				var elems = this.getBlocks(nodes);

				if (typeof nodes[0] != 'undefined' && nodes.length > 1 && nodes[0].nodeType == 3)
				{

					elems.unshift(this.getBlock());
				}

				var data = '', replaced = '';
				$.each(elems, $.proxy(function(i,s)
				{
					if (s.tagName == 'LI')
					{
						var $s = $(s);
						var cloned = $s.clone();
						cloned.find('ul', 'ol').remove();

						if (this.opts.linebreaks === false)
						{
							data += this.outerHtml($('<p>').append(cloned.contents()));
						}
						else
						{
							var clonedHtml = cloned.html().replace(/<br\s?\/?>$/i, '');
							data += clonedHtml + '<br>';
						}

						if (i == 0)
						{
							$s.addClass('redactor-replaced').empty();
							replaced = this.outerHtml($s);
						}
						else $s.remove();
					}

				}, this));
				html = this.$editor.html().replace(replaced, '</' + listTag + '>' + data + '<' + listTag + '>');

				this.$editor.html(html);
				this.$editor.find(listTag + ':empty').remove();

			}
			else
			{
				var firstParent = $(this.getParent()).closest('td');

				if (this.browser('msie') && !this.isIe11() && this.opts.linebreaks)
				{
					var wrapper = this.selectionWrap('div');
					var wrapperHtml = $(wrapper).html();
					var tmpList = $('<ul>');
					if (cmd == 'insertorderedlist')
					{
						tmpList = $('<ol>');
					}

					var tmpLi = $('<li>');

					if ($.trim(wrapperHtml) == '')
					{
						tmpLi.append(wrapperHtml + '<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
						tmpList.append(tmpLi);
						this.$editor.find('#selection-marker-1').replaceWith(tmpList);
					}
					else
					{
						tmpLi.append(wrapperHtml);
						tmpList.append(tmpLi);
						$(wrapper).replaceWith(tmpList);
					}
				}
				else
				{
					this.document.execCommand(cmd);
				}

				var parent = this.getParent();
				var $list = $(parent).closest('ol, ul');

				if (this.opts.linebreaks === false)
				{
					var listText = $.trim($list.text());
					if (listText == '')
					{
						$list.children('li').find('br').remove();
						$list.children('li').append('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
					}
				}

				if (firstParent.length != 0)
				{
					$list.wrapAll('<td>');
				}

				if ($list.length)
				{

					var $listParent = $list.parent();
					if (this.isParentRedactor($listParent) && $listParent[0].tagName != 'LI' && this.nodeTestBlocks($listParent[0]))
					{
						$listParent.replaceWith($listParent.contents());
					}
				}

				if (this.browser('mozilla'))
				{
					this.$editor.focus();
				}
			}

			this.selectionRestore();
			this.$editor.find('#selection-marker-1').removeAttr('id');
			this.sync();
			this.callback('execCommand', cmd, param);
			return;
		},
		indentingIndent: function()
		{
			this.indentingStart('indent');
		},
		indentingOutdent: function()
		{
			this.indentingStart('outdent');
		},
		indentingStart: function(cmd)
		{
			this.bufferSet();

			if (cmd === 'indent')
			{
				var block = this.getBlock();

				this.selectionSave();

				if (block && block.tagName == 'LI')
				{

					var parent = this.getParent();

					var $list = $(parent).closest('ol, ul');
					var listTag = $list[0].tagName;

					var elems = this.getBlocks();

					$.each(elems, function(i,s)
					{
						if (s.tagName == 'LI')
						{
							var $prev = $(s).prev();
							if ($prev.length != 0 && $prev[0].tagName == 'LI')
							{
								var $childList = $prev.children('ul, ol');
								if ($childList.length == 0)
								{
									$prev.append($('<' + listTag + '>').append(s));
								}
								else $childList.append(s);
							}
						}
					});
				}

				else if (block === false && this.opts.linebreaks === true)
				{
					this.exec('formatBlock', 'blockquote');
					var newblock = this.getBlock();
					var block = $('<div data-tagblock="">').html($(newblock).html());
					$(newblock).replaceWith(block);

					var left = this.normalize($(block).css('margin-left')) + this.opts.indentValue;
					$(block).css('margin-left', left + 'px');
				}
				else
				{

					var elements = this.getBlocks();
					$.each(elements, $.proxy(function(i, elem)
					{
						var $el = false;

						if (elem.tagName === 'TD') return;

						if ($.inArray(elem.tagName, this.opts.alignmentTags) !== -1)
						{
							$el = $(elem);
						}
						else
						{
							$el = $(elem).closest(this.opts.alignmentTags.toString().toLowerCase(), this.$editor[0]);
						}

						var left = this.normalize($el.css('margin-left')) + this.opts.indentValue;
						$el.css('margin-left', left + 'px');

					}, this));
				}

				this.selectionRestore();

			}

			else
			{
				this.selectionSave();

				var block = this.getBlock();
				if (block && block.tagName == 'LI')
				{

					var elems = this.getBlocks();
					var index = 0;

					this.insideOutdent(block, index, elems);
				}
				else
				{

					var elements = this.getBlocks();
					$.each(elements, $.proxy(function(i, elem)
					{
						var $el = false;

						if ($.inArray(elem.tagName, this.opts.alignmentTags) !== -1)
						{
							$el = $(elem);
						}
						else
						{
							$el = $(elem).closest(this.opts.alignmentTags.toString().toLowerCase(), this.$editor[0]);
						}

						var left = this.normalize($el.css('margin-left')) - this.opts.indentValue;
						if (left <= 0)
						{

							if (this.opts.linebreaks === true && typeof($el.data('tagblock')) !== 'undefined')
							{
								$el.replaceWith($el.html() + '<br>');
							}

							else
							{
								$el.css('margin-left', '');
								this.removeEmptyAttr($el, 'style');
							}
						}
						else
						{
							$el.css('margin-left', left + 'px');
						}

					}, this));
				}
				this.selectionRestore();
			}

			this.sync();

		},
		insideOutdent: function (li, index, elems)
		{
			if (li && li.tagName == 'LI')
			{
				var $parent = $(li).parent().parent();
				if ($parent.length != 0 && $parent[0].tagName == 'LI')
				{
					$parent.after(li);
				}
				else
				{
					if (typeof elems[index] != 'undefined')
					{
						li = elems[index];
						index++;

						this.insideOutdent(li, index, elems);
					}
					else
					{
						this.execCommand('insertunorderedlist');
					}
				}
			}
		},
		alignmentLeft: function()
		{
			this.alignmentSet('', 'JustifyLeft');
		},
		alignmentRight: function()
		{
			this.alignmentSet('right', 'JustifyRight');
		},
		alignmentCenter: function()
		{
			this.alignmentSet('center', 'JustifyCenter');
		},
		alignmentJustify: function()
		{
			this.alignmentSet('justify', 'JustifyFull');
		},
		alignmentSet: function(type, cmd)
		{
			this.bufferSet();

			if (this.oldIE())
			{
				this.document.execCommand(cmd, false, false);
				return true;
			}

			this.selectionSave();

			var block = this.getBlock();
			if (!block && this.opts.linebreaks)
			{

				this.exec('formatblock', 'div');

				var newblock = this.getBlock();
				var block = $('<div data-tagblock="">').html($(newblock).html());
				$(newblock).replaceWith(block);

				$(block).css('text-align', type);
				this.removeEmptyAttr(block, 'style');

				if (type == '' && typeof($(block).data('tagblock')) !== 'undefined')
				{
					$(block).replaceWith($(block).html());
				}
			}
			else
			{
				var elements = this.getBlocks();
				$.each(elements, $.proxy(function(i, elem)
				{
					var $el = false;

					if ($.inArray(elem.tagName, this.opts.alignmentTags) !== -1)
					{
						$el = $(elem);
					}
					else
					{
						$el = $(elem).closest(this.opts.alignmentTags.toString().toLowerCase(), this.$editor[0]);
					}

					if ($el)
					{
						$el.css('text-align', type);
						this.removeEmptyAttr($el, 'style');
					}

				}, this));
			}

			this.selectionRestore();
			this.sync();
		},
		cleanEmpty: function(html)
		{
			var ph = this.placeholderStart(html);
			if (ph !== false) return ph;

			if (this.opts.linebreaks === false)
			{
				if (html === '') html = this.opts.emptyHtml;
				else if (html.search(/^<hr\s?\/?>$/gi) !== -1) html = '<hr>' + this.opts.emptyHtml;
			}

			return html;
		},
		cleanConverters: function(html)
		{

			if (this.opts.convertDivs && !this.opts.gallery)
			{
				html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '<p$1>$2</p>');
			}

			if (this.opts.paragraphy) html = this.cleanParagraphy(html);

			return html;
		},
		cleanConvertProtected: function(html)
		{
			if (this.opts.templateVars)
			{
				html = html.replace(/\{\{(.*?)\}\}/gi, '<!-- template double $1 -->');
				html = html.replace(/\{(.*?)\}/gi, '<!-- template $1 -->');
			}

			html = html.replace(/<script(.*?)>([\w\W]*?)<\/script>/gi, '<title type="text/javascript" style="display: none;" class="redactor-script-tag"$1>$2</title>');
			html = html.replace(/<style(.*?)>([\w\W]*?)<\/style>/gi, '<section$1 style="display: none;" rel="redactor-style-tag">$2</section>');
			html = html.replace(/<form(.*?)>([\w\W]*?)<\/form>/gi, '<section$1 rel="redactor-form-tag">$2</section>');
			if (this.opts.phpTags) html = html.replace(/<\?php([\w\W]*?)\?>/gi, '<section style="display: none;" rel="redactor-php-tag">$1</section>');
			else html = html.replace(/<\?php([\w\W]*?)\?>/gi, '');

			return html;
		},
		cleanReConvertProtected: function(html)
		{
			if (this.opts.templateVars)
			{
				html = html.replace(/<!-- template double (.*?) -->/gi, '{{$1}}');
				html = html.replace(/<!-- template (.*?) -->/gi, '{$1}');
			}

			html = html.replace(/<title type="text\/javascript" style="display: none;" class="redactor-script-tag"(.*?)>([\w\W]*?)<\/title>/gi, '<script$1 type="text/javascript">$2</script>');
			html = html.replace(/<section(.*?) style="display: none;" rel="redactor-style-tag">([\w\W]*?)<\/section>/gi, '<style$1>$2</style>');
			html = html.replace(/<section(.*?)rel="redactor-form-tag"(.*?)>([\w\W]*?)<\/section>/gi, '<form$1$2>$3</form>');
			if (this.opts.phpTags) html = html.replace(/<section style="display: none;" rel="redactor-php-tag">([\w\W]*?)<\/section>/gi, '<?php\r\n$1\r\n?>');

			return html;
		},
		cleanRemoveSpaces: function(html, buffer)
		{
			if (buffer !== false)
			{
				var buffer = []
				var matches = html.match(/<(code|style|script|title)(.*?)>([\w\W]*?)<\/(code|style|script|title)>/gi);
				if (matches === null) matches = [];

				if (this.opts.phpTags)
				{
					var phpMatches = html.match(/<\?php([\w\W]*?)\?>/gi);
					if (phpMatches) matches = $.merge(matches, phpMatches);
				}

				if (matches)
				{
					$.each(matches, function(i, s)
					{
						html = html.replace(s, 'buffer_' + i);
						buffer.push(s);
					});
				}
			}

			html = html.replace(/\n/g, ' ');
			html = html.replace(/[\t]*/g, '');
			html = html.replace(/\n\s*\n/g, "\n");
			html = html.replace(/^[\s\n]*/g, ' ');
			html = html.replace(/[\s\n]*$/g, ' ');
			html = html.replace( />\s{2,}</g, '> <');

			html = this.cleanReplacer(html, buffer);

			html = html.replace(/\n\n/g, "\n");

			return html;
		},
		cleanReplacer: function(html, buffer)
		{
			if (buffer === false) return html;

			$.each(buffer, function(i,s)
			{
				html = html.replace('buffer_' + i, s);
			});

			return html;
		},
		cleanRemoveEmptyTags: function(html)
		{

			html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');

			var etagsInline = ["<b>\\s*</b>", "<b>&nbsp;</b>", "<em>\\s*</em>"]
			var etags = ["<code></code>", "<blockquote>\\s*</blockquote>", "<dd></dd>", "<dt></dt>", "<ul></ul>", "<ol></ol>", "<li></li>", "<table></table>", "<tr></tr>", "<span>\\s*<span>", "<span>&nbsp;<span>", "<p>\\s*</p>", "<p></p>", "<p>&nbsp;</p>",  "<p>\\s*<br>\\s*</p>", "<div>\\s*</div>", "<div>\\s*<br>\\s*</div>"];

			if (this.opts.removeEmptyTags)
			{
				etags = etags.concat(etagsInline);
			}
			else etags = etagsInline;

			var len = etags.length;
			for (var i = 0; i < len; ++i)
			{
				html = html.replace(new RegExp(etags[i], 'gi'), "");
			}

			return html;
		},
		cleanParagraphy: function(html)
		{
			html = $.trim(html);

			if (this.opts.linebreaks === true) return html;
			if (html === '' || html === '<p></p>') return this.opts.emptyHtml;

			html = html + "\n";

			if (this.opts.removeEmptyTags === false)
			{
				return html;
			}

			var safes = [];
			var matches = html.match(/<(table|div|code|object)(.*?)>([\w\W]*?)<\/(table|div|code|object)>/gi);
			if (!matches) matches = [];

			var commentsMatches = html.match(/<!--([\w\W]*?)-->/gi);
			if (commentsMatches) matches = $.merge(matches, commentsMatches);

			if (this.opts.phpTags)
			{
				var phpMatches = html.match(/<section(.*?)rel="redactor-php-tag">([\w\W]*?)<\/section>/gi);
				if (phpMatches) matches = $.merge(matches, phpMatches);
			}

			if (matches)
			{
				$.each(matches, function(i,s)
				{
					safes[i] = s;
					html = html.replace(s, '{replace' + i + '}\n');
				});
			}

			html = html.replace(/<br \/>\s*<br \/>/gi, "\n\n");
			html = html.replace(/<br><br>/gi, "\n\n");

			function R(str, mod, r)
			{
				return html.replace(new RegExp(str, mod), r);
			}

			var blocks = '(comment|html|body|head|title|meta|style|script|link|iframe|table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|code|select|option|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary)';

			html = R('(<' + blocks + '[^>]*>)', 'gi', "\n$1");
			html = R('(</' + blocks + '>)', 'gi', "$1\n\n");
			html = R("\r\n", 'g', "\n");
			html = R("\r", 'g', "\n");
			html = R("/\n\n+/", 'g', "\n\n");

			var htmls = html.split(new RegExp('\n\s*\n', 'g'), -1);

			html = '';
			for (var i in htmls)
			{
				if (htmls.hasOwnProperty(i))
                {
					if (htmls[i].search('{replace') == -1)
					{
						htmls[i] = htmls[i].replace(/<p>\n\t?<\/p>/gi, '');
						htmls[i] = htmls[i].replace(/<p><\/p>/gi, '');

						if (htmls[i] != '')
						{
							html += '<p>' +  htmls[i].replace(/^\n+|\n+$/g, "") + "</p>";
						}
					}
					else html += htmls[i];
				}
			}

			html = R('<p><p>', 'gi', '<p>');
			html = R('</p></p>', 'gi', '</p>');

			html = R('<p>\s?</p>', 'gi', '');

			html = R('<p>([^<]+)</(div|address|form)>', 'gi', "<p>$1</p></$2>");

			html = R('<p>(</?' + blocks + '[^>]*>)</p>', 'gi', "$1");
			html = R("<p>(<li.+?)</p>", 'gi', "$1");
			html = R('<p>\s?(</?' + blocks + '[^>]*>)', 'gi', "$1");

			html = R('(</?' + blocks + '[^>]*>)\s?</p>', 'gi', "$1");
			html = R('(</?' + blocks + '[^>]*>)\s?<br />', 'gi', "$1");
			html = R('<br />(\s*</?(?:p|li|div|dl|dd|dt|th|code|td|ul|ol)[^>]*>)', 'gi', '$1');
			html = R("\n</p>", 'gi', '</p>');

			html = R('<li><p>', 'gi', '<li>');
			html = R('</p></li>', 'gi', '</li>');
			html = R('</li><p>', 'gi', '</li>');
			html = R('<p>\t?\n?<p>', 'gi', '<p>');
			html = R('</dt><p>', 'gi', '</dt>');
			html = R('</dd><p>', 'gi', '</dd>');
			html = R('<br></p></blockquote>', 'gi', '</blockquote>');
			html = R('<p>\t*</p>', 'gi', '');
			$.each(safes, function(i,s)
			{
				html = html.replace('{replace' + i + '}', s);
			});

			return $.trim(html);
		},
		cleanConvertInlineTags: function(html, set)
		{
			var boldTag = 'strong';
			if (this.opts.boldTag === 'b') boldTag = 'b';

			var italicTag = 'em';
			if (this.opts.italicTag === 'i') italicTag = 'i';

			html = html.replace(/<span style="font-style: italic;">([\w\W]*?)<\/span>/gi, '<' + italicTag + '>$1</' + italicTag + '>');
			html = html.replace(/<span style="font-weight: bold;">([\w\W]*?)<\/span>/gi, '<' + boldTag + '>$1</' + boldTag + '>');
			if (this.opts.boldTag === 'strong') html = html.replace(/<b>([\w\W]*?)<\/b>/gi, '<strong>$1</strong>');
			else html = html.replace(/<strong>([\w\W]*?)<\/strong>/gi, '<b>$1</b>');

			if (this.opts.italicTag === 'em') html = html.replace(/<i>([\w\W]*?)<\/i>/gi, '<em>$1</em>');
			else html = html.replace(/<em>([\w\W]*?)<\/em>/gi, '<i>$1</i>');

			html = html.replace(/<span style="text-decoration: underline;">([\w\W]*?)<\/span>/gi, '<u>$1</u>');

			if (set !== true) html = html.replace(/<strike>([\w\W]*?)<\/strike>/gi, '<del>$1</del>');
			else html = html.replace(/<del>([\w\W]*?)<\/del>/gi, '<strike>$1</strike>');

			return html;
		},
		cleanStripTags: function(html)
		{
			if (html == '' || typeof html == 'undefined') return html;

			var allowed = false;
			if (this.opts.allowedTags !== false) allowed = true;

			var arr = allowed === true ? this.opts.allowedTags : this.opts.deniedTags;

			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
			html = html.replace(tags, function ($0, $1)
			{
				if (allowed === true) return $.inArray($1.toLowerCase(), arr) > '-1' ? $0 : '';
				else return $.inArray($1.toLowerCase(), arr) > '-1' ? '' : $0;
			});

			html = this.cleanConvertInlineTags(html);

			return html;

		},
		cleanSavePreCode: function(html, encode)
		{
			var pre = html.match(/<(pre|code)(.*?)>([\w\W]*?)<\/(pre|code)>/gi);
			if (pre !== null)
			{
				$.each(pre, $.proxy(function(i,s)
				{
					var arr = s.match(/<(pre|code)(.*?)>([\w\W]*?)<\/(pre|code)>/i);

					arr[3] = arr[3].replace(/&nbsp;/g, ' ');

					if (encode !== false) arr[3] = this.cleanEncodeEntities(arr[3]);

					arr[3] = arr[3].replace(/\$/g, '&#36;');

					html = html.replace(s, '<' + arr[1] + arr[2] + '>' + arr[3] + '</' + arr[1] + '>');

				}, this));
			}

			return html;
		},
		cleanEncodeEntities: function(str)
		{
			str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
		cleanUnverified: function()
		{

			var $elem = this.$editor.find('li, img, a, b, strong, sub, sup, i, em, u, small, strike, del, span, cite');

			$elem.filter('[style*="background-color: transparent;"][style*="line-height"]')
			.css('background-color', '')
			.css('line-height', '');

			$elem.filter('[style*="background-color: transparent;"]')
			.css('background-color', '');

			$elem.css('line-height', '');

			$.each($elem, $.proxy(function(i,s)
			{
				this.removeEmptyAttr(s, 'style');
			}, this));

			var $elem2 = this.$editor.find('b, strong, i, em, u, strike, del');
			$elem2.css('font-size', '');

			$.each($elem2, $.proxy(function(i,s)
			{
				this.removeEmptyAttr(s, 'style');
			}, this));
			this.$editor.find('div[style="text-align: -webkit-auto;"]').contents().unwrap();
			this.$editor.find('ul, ol, li').removeAttr('style');
		},

		cleanHtml: function(code)
		{
			var i = 0,
			codeLength = code.length,
			point = 0,
			start = null,
			end = null,
			tag = '',
			out = '',
			cont = '';

			this.cleanlevel = 0;

			for (; i < codeLength; i++)
			{
				point = i;
				if (-1 == code.substr(i).indexOf( '<' ))
				{
					out += code.substr(i);

					return this.cleanFinish(out);
				}
				while (point < codeLength && code.charAt(point) != '<')
				{
					point++;
				}

				if (i != point)
				{
					cont = code.substr(i, point - i);
					if (!cont.match(/^\s{2,}$/g))
					{
						if ('\n' == out.charAt(out.length - 1)) out += this.cleanGetTabs();
						else if ('\n' == cont.charAt(0))
						{
							out += '\n' + this.cleanGetTabs();
							cont = cont.replace(/^\s+/, '');
						}

						out += cont;
					}

					if (cont.match(/\n/)) out += '\n' + this.cleanGetTabs();
				}

				start = point;
				while (point < codeLength && '>' != code.charAt(point))
				{
					point++;
				}

				tag = code.substr(start, point - start);
				i = point;

				var t;

				if ('!--' == tag.substr(1, 3))
				{
					if (!tag.match(/--$/))
					{
						while ('-->' != code.substr(point, 3))
						{
							point++;
						}
						point += 2;
						tag = code.substr(start, point - start);
						i = point;
					}

					if ('\n' != out.charAt(out.length - 1)) out += '\n';

					out += this.cleanGetTabs();
					out += tag + '>\n';
				}
				else if ('!' == tag[1])
				{
					out = this.placeTag(tag + '>', out);
				}
				else if ('?' == tag[1])
				{
					out += tag + '>\n';
				}
				else if (t = tag.match(/^<(script|style|pre|code)/i))
				{
					t[1] = t[1].toLowerCase();
					tag = this.cleanTag(tag);
					out = this.placeTag(tag, out);
					end = String(code.substr(i + 1)).toLowerCase().indexOf('</' + t[1]);

					if (end)
					{
						cont = code.substr(i + 1, end);
						i += end;
						out += cont;
					}
				}
				else
				{
					tag = this.cleanTag(tag);
					out = this.placeTag(tag, out);
				}
			}

			return this.cleanFinish(out);
		},
		cleanGetTabs: function()
		{
			var s = '';
			for ( var j = 0; j < this.cleanlevel; j++ )
			{
				s += '\t';
			}

			return s;
		},
		cleanFinish: function(code)
		{
			code = code.replace(/\n\s*\n/g, '\n');
			code = code.replace(/^[\s\n]*/, '');
			code = code.replace(/[\s\n]*$/, '');
			code = code.replace(/<script(.*?)>\n<\/script>/gi, '<script$1></script>');

			this.cleanlevel = 0;

			return code;
		},
		cleanTag: function (tag)
		{
			var tagout = '';
			tag = tag.replace(/\n/g, ' ');
			tag = tag.replace(/\s{2,}/g, ' ');
			tag = tag.replace(/^\s+|\s+$/g, ' ');

			var suffix = '';
			if (tag.match(/\/$/))
			{
				suffix = '/';
				tag = tag.replace(/\/+$/, '');
			}

			var m;
			while (m = /\s*([^= ]+)(?:=((['"']).*?\3|[^ ]+))?/.exec(tag))
			{
				if (m[2]) tagout += m[1].toLowerCase() + '=' + m[2];
				else if (m[1]) tagout += m[1].toLowerCase();

				tagout += ' ';
				tag = tag.substr(m[0].length);
			}

			return tagout.replace(/\s*$/, '') + suffix + '>';
		},
		placeTag: function (tag, out)
		{
			var nl = tag.match(this.cleannewLevel);
			if (tag.match(this.cleanlineBefore) || nl)
			{
				out = out.replace(/\s*$/, '');
				out += '\n';
			}

			if (nl && '/' == tag.charAt(1)) this.cleanlevel--;
			if ('\n' == out.charAt(out.length - 1)) out += this.cleanGetTabs();
			if (nl && '/' != tag.charAt(1)) this.cleanlevel++;

			out += tag;

			if (tag.match(this.cleanlineAfter) || tag.match(this.cleannewLevel))
			{
				out = out.replace(/ *$/, '');
				out += '\n';
			}

			return out;
		},
		formatEmpty: function(e)
		{
			var html = $.trim(this.$editor.html());

			if (this.opts.linebreaks)
			{
				if (html == '')
				{
					e.preventDefault();
					this.$editor.html('');
					this.focus();
				}
			}
			else
			{
				html = html.replace(/<br\s?\/?>/i, '');
				var thtml = html.replace(/<p>\s?<\/p>/gi, '');

				if (html === '' || thtml === '')
				{
					e.preventDefault();

					var node = $(this.opts.emptyHtml).get(0);
					this.$editor.html(node);
					this.focus();
				}
			}

			this.sync();
		},
		formatBlocks: function(tag)
		{
			if (this.browser('mozilla') && this.isFocused())
			{
				this.$editor.focus();
			}

			this.bufferSet();

			var nodes = this.getBlocks();
			this.selectionSave();

			$.each(nodes, $.proxy(function(i, node)
			{
				if (node.tagName !== 'LI')
				{
					var parent = $(node).parent();

					if (tag === 'p')
					{
						if ((node.tagName === 'P'
						&& parent.length != 0
						&& parent[0].tagName === 'BLOCKQUOTE')
						||
						node.tagName === 'BLOCKQUOTE')
						{
							this.formatQuote();
							return;
						}
						else if (this.opts.linebreaks)
						{
							if (node && node.tagName.search(/H[1-6]/) == 0)
							{
								$(node).replaceWith(node.innerHTML + '<br>');
							}
							else return;
						}
						else
						{
							this.formatBlock(tag, node);
						}
					}
					else
					{
						this.formatBlock(tag, node);
					}
				}

			}, this));

			this.selectionRestore();
			this.sync();
		},
		formatBlock: function(tag, block)
		{
			if (block === false) block = this.getBlock();
			if (block === false && this.opts.linebreaks === true)
			{
				this.execCommand('formatblock', tag);
				return true;
			}

			var contents = '';
			if (tag !== 'code')
			{
				contents = $(block).contents();
			}
			else
			{

				contents = $(block).html();
				if ($.trim(contents) === '')
				{
					contents = '<span id="selection-marker-1"></span>';
				}
			}

			if (block.tagName === 'CODE') tag = 'p';

			if (this.opts.linebreaks === true && tag === 'p')
			{
				$(block).replaceWith($('<div>').append(contents).html() + '<br>');
			}
			else
			{
				var parent = this.getParent();

				var node = $('<' + tag + '>').append(contents);
				$(block).replaceWith(node);

				if (parent && parent.tagName == 'TD')
				{
					$(node).wrapAll('<td>');
				}
			}
		},
		formatChangeTag: function(fromElement, toTagName, save)
		{
			if (save !== false) this.selectionSave();

			var newElement = $('<' + toTagName + '/>');
			$(fromElement).replaceWith(function() { return newElement.append($(this).contents()); });

			if (save !== false) this.selectionRestore();

			return newElement;
		},
		formatQuote: function()
		{
			if (this.browser('mozilla') && this.isFocused())
			{
				this.$editor.focus();
			}

			this.bufferSet();
			if (this.opts.linebreaks === false)
			{
				this.selectionSave();

				var blocks = this.getBlocks();

				var blockquote = false;
				var blocksLen = blocks.length;
				if (blocks)
				{
					var data = '';
					var replaced = '';
					var replace = false;
					var paragraphsOnly = true;

					$.each(blocks, function(i,s)
					{
						if (s.tagName !== 'P') paragraphsOnly = false;
					});

					$.each(blocks, $.proxy(function(i,s)
					{
						if (s.tagName === 'BLOCKQUOTE')
						{
							this.formatBlock('p', s, false);
						}
						else if (s.tagName === 'P')
						{
							blockquote = $(s).parent();

							if (blockquote[0].tagName == 'BLOCKQUOTE')
							{
								var count = $(blockquote).children('p').length;
								if (count == 1)
								{
									$(blockquote).replaceWith(s);
								}

								else if (count == blocksLen)
								{
									replace = 'blockquote';
									data += this.outerHtml(s);
								}

								else
								{
									replace = 'html';
									data += this.outerHtml(s);

									if (i == 0)
									{
										$(s).addClass('redactor-replaced').empty();
										replaced = this.outerHtml(s);
									}
									else $(s).remove();
								}
							}

							else
							{
								if (paragraphsOnly === false || blocks.length == 1)
								{
									this.formatBlock('blockquote', s, false);
								}
								else
								{
									replace = 'paragraphs';
									data += this.outerHtml(s);
								}
							}

						}
						else if (s.tagName !== 'LI')
						{
							this.formatBlock('blockquote', s, false);
						}

					}, this));

					if (replace)
					{
						if (replace == 'paragraphs')
						{
							$(blocks[0]).replaceWith('<blockquote>' + data + '</blockquote>');
							$(blocks).remove();
						}
						else if (replace == 'blockquote')
						{
							$(blockquote).replaceWith(data);
						}
						else if (replace == 'html')
						{
							var html = this.$editor.html().replace(replaced, '</blockquote>' + data + '<blockquote>');

							this.$editor.html(html);
							this.$editor.find('blockquote').each(function()
							{
								if ($.trim($(this).html()) == '') $(this).remove();
							})
						}
					}
				}

				this.selectionRestore();
			}

			else
			{
				var block = this.getBlock();
				if (block.tagName === 'BLOCKQUOTE')
				{
					this.selectionSave();

					var html = $.trim($(block).html());
					var selection = $.trim(this.getSelectionHtml());

					html = html.replace(/<span(.*?)id="selection-marker(.*?)<\/span>/gi, '');

					if (html == selection)
					{
						$(block).replaceWith($(block).html() + '<br>');
					}
					else
					{

						this.inlineFormat('tmp');
						var tmp = this.$editor.find('tmp');
						tmp.empty();

						var newhtml = this.$editor.html().replace('<tmp></tmp>', '</blockquote><span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>' + selection + '<blockquote>');

						this.$editor.html(newhtml);
						tmp.remove();
						this.$editor.find('blockquote').each(function()
						{
							if ($.trim($(this).html()) == '') $(this).remove();
						})
					}

					this.selectionRestore();
					this.$editor.find('span#selection-marker-1').attr('id', false);
				}
				else
				{
					var wrapper = this.selectionWrap('blockquote');
					var html = $(wrapper).html();

					var blocksElemsRemove = ['ul', 'ol', 'table', 'tr', 'tbody', 'thead', 'tfoot', 'dl'];
					$.each(blocksElemsRemove, function(i,s)
					{
						html = html.replace(new RegExp('<' + s + '(.*?)>', 'gi'), '');
						html = html.replace(new RegExp('</' + s + '>', 'gi'), '');
					});

					var blocksElems = this.opts.blockLevelElements;
					$.each(blocksElems, function(i,s)
					{
						html = html.replace(new RegExp('<' + s + '(.*?)>', 'gi'), '');
						html = html.replace(new RegExp('</' + s + '>', 'gi'), '<br>');
					});

					$(wrapper).html(html);
					this.selectionElement(wrapper);
					var next = $(wrapper).next();
					if (next.length != 0 && next[0].tagName === 'BR')
					{
						next.remove();
					}
				}
			}

			this.sync();
		},
		blockRemoveAttr: function(attr, value)
		{
			var nodes = this.getBlocks();
			$(nodes).removeAttr(attr);

			this.sync();
		},
		blockSetAttr: function(attr, value)
		{
			var nodes = this.getBlocks();
			$(nodes).attr(attr, value);

			this.sync();
		},
		blockRemoveStyle: function(rule)
		{
			var nodes = this.getBlocks();
			$(nodes).css(rule, '');
			this.removeEmptyAttr(nodes, 'style');

			this.sync();
		},
		blockSetStyle: function (rule, value)
		{
			var nodes = this.getBlocks();
			$(nodes).css(rule, value);

			this.sync();
		},
		blockRemoveClass: function(className)
		{
			var nodes = this.getBlocks();
			$(nodes).removeClass(className);
			this.removeEmptyAttr(nodes, 'class');

			this.sync();
		},
		blockSetClass: function(className)
		{
			var nodes = this.getBlocks();
			$(nodes).addClass(className);

			this.sync();
		},
		inlineRemoveClass: function(className)
		{
			this.selectionSave();

			this.inlineEachNodes(function(node)
			{
				$(node).removeClass(className);
				this.removeEmptyAttr(node, 'class');
			});

			this.selectionRestore();
			this.sync();
		},
		inlineSetClass: function(className)
		{
			var current = this.getCurrent();
			if (!$(current).hasClass(className)) this.inlineMethods('addClass', className);
		},
		inlineRemoveStyle: function (rule)
		{
			this.selectionSave();

			this.inlineEachNodes(function(node)
			{
				$(node).css(rule, '');
				this.removeEmptyAttr(node, 'style');
			});

			this.selectionRestore();
			this.sync();
		},
		inlineSetStyle: function(rule, value)
		{
			this.inlineMethods('css', rule, value);
		},
		inlineRemoveAttr: function (attr)
		{
			this.selectionSave();

			var range = this.getRange(), node = this.getElement(), nodes = this.getNodes();

			if (range.collapsed || range.startContainer === range.endContainer && node)
			{
				nodes = $( node );
			}

			$(nodes).removeAttr(attr);

			this.inlineUnwrapSpan();

			this.selectionRestore();
			this.sync();
		},
		inlineSetAttr: function(attr, value)
		{
			this.inlineMethods('attr', attr, value );
		},
		inlineMethods: function(type, attr, value)
		{
			this.bufferSet();
			this.selectionSave();

			var range = this.getRange()
			var el = this.getElement();

			if ((range.collapsed || range.startContainer === range.endContainer) && el && !this.nodeTestBlocks(el))
			{
				$(el)[type](attr, value);
			}
			else
			{
				var cmd, arg = value;
				switch (attr)
				{
					case 'font-size':
						cmd = 'fontSize';
						arg = 4;
					break;
					case 'font-family':
						cmd = 'fontName';
					break;
					case 'color':
						cmd = 'foreColor';
					break;
					case 'background-color':
						cmd = 'backColor';
					break;
				}

				this.document.execCommand(cmd, false, arg);

				var fonts = this.$editor.find('font');
				$.each(fonts, $.proxy(function(i, s)
				{
					this.inlineSetMethods(type, s, attr, value);

				}, this));

			}

			this.selectionRestore();
			this.sync();
		},
		inlineSetMethods: function(type, s, attr, value)
		{
			var parent = $(s).parent(), el;

			var selectionHtml = this.getSelectionText();
			var parentHtml = $(parent).text();
			var selected = selectionHtml == parentHtml;

			if (selected && parent && parent[0].tagName === 'INLINE' && parent[0].attributes.length != 0)
			{
				el = parent;
				$(s).replaceWith($(s).html());
			}
			else
			{
				el = $('<inline>').append($(s).contents());
				$(s).replaceWith(el);
			}
			$(el)[type](attr, value);

			return el;
		},

		inlineEachNodes: function(callback)
		{
			var range = this.getRange(),
				node = this.getElement(),
				nodes = this.getNodes(),
				collapsed;

			if (range.collapsed || range.startContainer === range.endContainer && node)
			{
				nodes = $(node);
				collapsed = true;
			}

			$.each(nodes, $.proxy(function(i, node)
			{
				if (!collapsed && node.tagName !== 'INLINE')
				{
					var selectionHtml = this.getSelectionText();
					var parentHtml = $(node).parent().text();
					var selected = selectionHtml == parentHtml;

					if (selected && node.parentNode.tagName === 'INLINE' && !$(node.parentNode).hasClass('redactor_editor'))
					{
						node = node.parentNode;
					}
					else return;
				}
				callback.call(this, node);

			}, this ) );
		},
		inlineUnwrapSpan: function()
		{
			var $spans = this.$editor.find('inline');

			$.each($spans, $.proxy(function(i, span)
			{
				var $span = $(span);

				if ($span.attr('class') === undefined && $span.attr('style') === undefined)
				{
					$span.contents().unwrap();
				}

			}, this));
		},
		inlineFormat: function(tag)
		{
			this.selectionSave();

			this.document.execCommand('fontSize', false, 4 );

			var fonts = this.$editor.find('font');
			var last;
			$.each(fonts, function(i, s)
			{
				var el = $('<' + tag + '/>').append($(s).contents());
				$(s).replaceWith(el);
				last = el;
			});

			this.selectionRestore();

			this.sync();
		},
		inlineRemoveFormat: function(tag)
		{
			this.selectionSave();

			var utag = tag.toUpperCase();
			var nodes = this.getNodes();
			var parent = $(this.getParent()).parent();

			$.each(nodes, function(i, s)
			{
				if (s.tagName === utag) this.inlineRemoveFormatReplace(s);
			});

			if (parent && parent[0].tagName === utag) this.inlineRemoveFormatReplace(parent);

			this.selectionRestore();
			this.sync();
		},
		inlineRemoveFormatReplace: function(el)
		{
			$(el).replaceWith($(el).contents());
		},

		insertHtml: function (html, sync)
		{
			var current = this.getCurrent();
			var parent = current.parentNode;

			this.focusWithSaveScroll();

			this.bufferSet();

			var $html = $('<div>').append($.parseHTML(html));
			html = $html.html();

			html = this.cleanRemoveEmptyTags(html);
			$html = $('<div>').append($.parseHTML(html));
			var currBlock = this.getBlock();

			if ($html.contents().length == 1)
			{
				var htmlTagName = $html.contents()[0].tagName;
				if (htmlTagName != 'P' && htmlTagName == currBlock.tagName || htmlTagName == 'CODE')
				{

					$html = $('<div>').append(html);
				}
			}

			if (this.opts.linebreaks)
			{
				html = html.replace(/<p(.*?)>([\w\W]*?)<\/p>/gi, '$2<br>');
			}
			if (!this.opts.linebreaks && $html.contents().length == 1 && $html.contents()[0].nodeType == 3
				&& (this.getRangeSelectedNodes().length > 2 || (!current || current.tagName == 'BODY' && !parent || parent.tagName == 'HTML')))
			{
				html = '<p>' + html + '</p>';
			}

			html = this.setSpansVerifiedHtml(html);

			if ($html.contents().length > 1 && currBlock
			|| $html.contents().is('p, :header, ul, ol, li, div, table, td, blockquote, code, address, section, header, footer, aside, article'))
			{
				if (this.browser('msie'))
				{
					if (!this.isIe11())
					{
						this.document.selection.createRange().pasteHTML(html);
					}
					else
					{
						this.execPasteFrag(html);
					}
				}
				else
				{
					this.document.execCommand('inserthtml', false, html);
				}
			}
			else this.insertHtmlAdvanced(html, false);

			if (this.selectall)
			{
				this.window.setTimeout($.proxy(function()
				{
					if (!this.opts.linebreaks) this.selectionEnd(this.$editor.contents().last());
					else this.focusEnd();

				}, this), 1);
			}

			this.observeStart();
			this.setNonEditable();

			if (sync !== false) this.sync();
		},
		insertHtmlAdvanced: function(html, sync)
		{
			html = this.setSpansVerifiedHtml(html);

			var sel = this.getSelection();

			if (sel.getRangeAt && sel.rangeCount)
			{
				var range = sel.getRangeAt(0);
				range.deleteContents();

				var el = document.createElement('div');
				el.innerHTML = html;
				var frag = document.createDocumentFragment(), node, lastNode;
				while ((node = el.firstChild))
				{
					lastNode = frag.appendChild(node);
				}

				range.insertNode(frag);

				if (lastNode)
				{
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}

			if (sync !== false)
			{
				this.sync();
			}

		},
		insertBeforeCursor: function(html)
		{
			html = this.setSpansVerifiedHtml(html);

			var node = $(html);

			var space = document.createElement("span");
			space.innerHTML = "\u200B";

			var range = this.getRange();
			range.insertNode(space);
			range.insertNode(node[0]);
			range.collapse(false);

			var sel = this.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);

			this.sync();
		},
		insertText: function(html)
		{
			var $html = $($.parseHTML(html));

			if ($html.length) html = $html.text();

			this.focusWithSaveScroll();

			if (this.browser('msie'))
			{
				if (!this.isIe11())
				{
					this.document.selection.createRange().pasteHTML(html);
				}
				else
				{
					this.execPasteFrag(html);
				}
			}
			else
			{
				this.document.execCommand('inserthtml', false, html);
			}

			this.sync();
		},
		insertNode: function(node)
		{
			node = node[0] || node;

			if (node.tagName == 'SPAN')
			{
				var replacementTag = 'inline';

			    var outer = node.outerHTML;
			    var regex = new RegExp('<' + node.tagName, 'i');
			    var newTag = outer.replace(regex, '<' + replacementTag);
			    regex = new RegExp('</' + node.tagName, 'i');
			    newTag = newTag.replace(regex, '</' + replacementTag);
			    node = $(newTag)[0];
			}

			var sel = this.getSelection();
			if (sel.getRangeAt && sel.rangeCount)
			{

				range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(node);
				range.setEndAfter(node);
				range.setStartAfter(node);
				sel.removeAllRanges();
				sel.addRange(range);
			}

			return node;
		},
		insertNodeToCaretPositionFromPoint: function(e, node)
		{
			var range;
			var x = e.clientX, y = e.clientY;
			if (this.document.caretPositionFromPoint)
			{
			    var pos = this.document.caretPositionFromPoint(x, y);
			    range = this.getRange();
			    range.setStart(pos.offsetNode, pos.offset);
			    range.collapse(true);
			    range.insertNode(node);
			}
			else if (this.document.caretRangeFromPoint)
			{
			    range = this.document.caretRangeFromPoint(x, y);
			    range.insertNode(node);
			}
			else if (typeof document.body.createTextRange != "undefined")
			{
		        range = this.document.body.createTextRange();
		        range.moveToPoint(x, y);
		        var endRange = range.duplicate();
		        endRange.moveToPoint(x, y);
		        range.setEndPoint("EndToEnd", endRange);
		        range.select();
			}

		},
		insertAfterLastElement: function(element, parent)
		{
			if (typeof(parent) != 'undefined') element = parent;

			if (this.isEndOfElement())
			{
				if (this.opts.linebreaks)
				{
					var contents = $('<div>').append($.trim(this.$editor.html())).contents();
					var last = contents.last()[0];
					if (last.tagName == 'SPAN' && last.innerHTML == '')
					{
						last = contents.prev()[0];
					}

					if (this.outerHtml(last) != this.outerHtml(element))
					{
						return false;
					}
				}
				else
				{
					if (this.$editor.contents().last()[0] !== element)
					{
						return false;
					}
				}

				this.insertingAfterLastElement(element);
			}
		},
		insertingAfterLastElement: function(element)
		{
			this.bufferSet();

			if (this.opts.linebreaks === false)
			{
				var node = $(this.opts.emptyHtml);
				$(element).after(node);
				this.selectionStart(node);
			}
			else
			{
				var node = $('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>', this.document)[0];
				$(element).after(node);
				$(node).after(this.opts.invisibleSpace);
				this.selectionRestore();
				this.$editor.find('span#selection-marker-1').removeAttr('id');
			}
		},
		insertLineBreak: function(twice)
		{
			this.selectionSave();

			var br = '<br>';
			if (twice == true)
			{
				br = '<br><br>';
			}

			if (this.browser('mozilla'))
			{
				var span = $('<span>').html(this.opts.invisibleSpace);
				this.$editor.find('#selection-marker-1').before(br).before(span).before(this.opts.invisibleSpace);

				this.setCaretAfter(span[0]);
				span.remove();

				this.selectionRemoveMarkers();
			}
			else
			{
				var parent = this.getParent();
				if (parent && parent.tagName === 'A')
				{
					var offset = this.getCaretOffset(parent);

					var text = $.trim($(parent).text()).replace(/\n\r\n/g, '');
					var len = text.length;

					if (offset == len)
					{
						this.selectionRemoveMarkers();

						var node = $('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>', this.document)[0];
						$(parent).after(node);
						$(node).before(br + (this.browser('webkit') ? this.opts.invisibleSpace : ''));
						this.selectionRestore();

						return true;
					}

				}

				this.$editor.find('#selection-marker-1').before(br + (this.browser('webkit') ? this.opts.invisibleSpace : ''));
				this.selectionRestore();
			}
		},
		insertDoubleLineBreak: function()
		{
			this.insertLineBreak(true);
		},
		replaceLineBreak: function(element)
		{
			var node = $('<br>' + this.opts.invisibleSpace);
			$(element).replaceWith(node);
			this.selectionStart(node);
		},
		pasteClean: function(html)
		{
			html = this.callback('pasteBefore', false, html);
			if (this.browser('msie'))
			{
				var tmp = $.trim(html);
				if (tmp.search(/^<a(.*?)>(.*?)<\/a>$/i) == 0)
				{
					html = html.replace(/^<a(.*?)>(.*?)<\/a>$/i, "$2");
				}
			}
            html = html.replace(/on([a-z]+)=|javascript\:/gi, '');
			if (this.opts.pastePlainText)
			{
				var tmp = this.document.createElement('div');

				html = html.replace(/<br>|<\/H[1-6]>|<\/p>|<\/div>/gi, '\n');

				tmp.innerHTML = html;
				html = tmp.textContent || tmp.innerText;

				html = $.trim(html);
				html = html.replace('\n', '<br>');
				html = this.cleanParagraphy(html);

				this.pasteInsert(html);
				return false;
			}
			var tablePaste = false;
			if (this.currentOrParentIs('TD'))
			{
				tablePaste = true;
				var blocksElems = this.opts.blockLevelElements;
				blocksElems.push('tr');
				blocksElems.push('table');
				$.each(blocksElems, function(i,s)
				{
					html = html.replace(new RegExp('<' + s + '(.*?)>', 'gi'), '');
					html = html.replace(new RegExp('</' + s + '>', 'gi'), '<br>');
				});
			}
			if (this.currentOrParentIs('CODE'))
			{
				html = this.pastePre(html);
				this.pasteInsert(html);
				return true;
			}
			html = html.replace(/<img(.*?)v:shapes=(.*?)>/gi, '');
			html = html.replace(/<p(.*?)class="MsoListParagraphCxSpFirst"([\w\W]*?)<\/p>/gi, '<ul><li$2</li>');
			html = html.replace(/<p(.*?)class="MsoListParagraphCxSpMiddle"([\w\W]*?)<\/p>/gi, '<li$2</li>');
			html = html.replace(/<p(.*?)class="MsoListParagraphCxSpLast"([\w\W]*?)<\/p>/gi, '<li$2</li></ul>');

			html = html.replace(/<p(.*?)class="MsoListParagraph"([\w\W]*?)<\/p>/gi, '<ul><li$2</li></ul>');

			html = html.replace(/·/g, '');
			html = html.replace(/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi, '');
			if (this.opts.cleanSpaces === true)
			{
				html = html.replace(/(&nbsp;){2,}/gi, '&nbsp;');
				html = html.replace(/&nbsp;/gi, ' ');
			}
			html = html.replace(/<b\sid="internal-source-marker(.*?)">([\w\W]*?)<\/b>/gi, "$2");
			html = html.replace(/<b(.*?)id="docs-internal-guid(.*?)">([\w\W]*?)<\/b>/gi, "$3");
	 		html = html.replace(/<span[^>]*(font-style: italic; font-weight: bold|font-weight: bold; font-style: italic)[^>]*>/gi, '<span style="font-weight: bold;"><span style="font-style: italic;">');
	 		html = html.replace(/<span[^>]*font-style: italic[^>]*>/gi, '<span style="font-style: italic;">');
			html = html.replace(/<span[^>]*font-weight: bold[^>]*>/gi, '<span style="font-weight: bold;">');
			html = html.replace(/<span[^>]*text-decoration: underline[^>]*>/gi, '<span style="text-decoration: underline;">');
			html = html.replace(/<td>\u200b*<\/td>/gi, '[td]');
			html = html.replace(/<td>&nbsp;<\/td>/gi, '[td]');
			html = html.replace(/<td><br><\/td>/gi, '[td]');
			html = html.replace(/<td(.*?)colspan="(.*?)"(.*?)>([\w\W]*?)<\/td>/gi, '[td colspan="$2"]$4[/td]');
			html = html.replace(/<td(.*?)rowspan="(.*?)"(.*?)>([\w\W]*?)<\/td>/gi, '[td rowspan="$2"]$4[/td]');
			html = html.replace(/<a(.*?)href="(.*?)"(.*?)>([\w\W]*?)<\/a>/gi, '[a href="$2"]$4[/a]');
			html = html.replace(/<iframe(.*?)>([\w\W]*?)<\/iframe>/gi, '[iframe$1]$2[/iframe]');
			html = html.replace(/<video(.*?)>([\w\W]*?)<\/video>/gi, '[video$1]$2[/video]');
			html = html.replace(/<audio(.*?)>([\w\W]*?)<\/audio>/gi, '[audio$1]$2[/audio]');
			html = html.replace(/<embed(.*?)>([\w\W]*?)<\/embed>/gi, '[embed$1]$2[/embed]');
			html = html.replace(/<object(.*?)>([\w\W]*?)<\/object>/gi, '[object$1]$2[/object]');
			html = html.replace(/<param(.*?)>/gi, '[param$1]');

			html = html.replace(/<img(.*?)>/gi, '[img$1]');
			html = html.replace(/ class="(.*?)"/gi, '');
			html = html.replace(/<(\w+)([\w\W]*?)>/gi, '<$1>');
			if (this.opts.linebreaks)
			{

				html = html.replace(/<strong><\/strong>/gi, '');
				html = html.replace(/<u><\/u>/gi, '');

				if (this.opts.cleanFontTag)
				{
					html = html.replace(/<font(.*?)>([\w\W]*?)<\/font>/gi, '$2');
				}

				html = html.replace(/<[^\/>][^>]*>(\s*|\t*|\n*|&nbsp;|<br>)<\/[^>]+>/gi, '<br>');
			}
			else
			{
				html = html.replace(/<[^\/>][^>]*>(\s*|\t*|\n*|&nbsp;|<br>)<\/[^>]+>/gi, '');
			}

			html = html.replace(/<div>\s*?\t*?\n*?(<ul>|<ol>|<p>)/gi, '$1');
			html = html.replace(/\[td colspan="(.*?)"\]([\w\W]*?)\[\/td\]/gi, '<td colspan="$1">$2</td>');
			html = html.replace(/\[td rowspan="(.*?)"\]([\w\W]*?)\[\/td\]/gi, '<td rowspan="$1">$2</td>');
			html = html.replace(/\[td\]/gi, '<td>&nbsp;</td>');
			html = html.replace(/\[a href="(.*?)"\]([\w\W]*?)\[\/a\]/gi, '<a href="$1">$2</a>');
			html = html.replace(/\[iframe(.*?)\]([\w\W]*?)\[\/iframe\]/gi, '<iframe$1>$2</iframe>');
			html = html.replace(/\[video(.*?)\]([\w\W]*?)\[\/video\]/gi, '<video$1>$2</video>');
			html = html.replace(/\[audio(.*?)\]([\w\W]*?)\[\/audio\]/gi, '<audio$1>$2</audio>');
			html = html.replace(/\[embed(.*?)\]([\w\W]*?)\[\/embed\]/gi, '<embed$1>$2</embed>');
			html = html.replace(/\[object(.*?)\]([\w\W]*?)\[\/object\]/gi, '<object$1>$2</object>');
			html = html.replace(/\[param(.*?)\]/gi, '<param$1>');
			html = html.replace(/\[img(.*?)\]/gi, '<img$1>');
			if (this.opts.convertDivs)
			{
				html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '<p>$2</p>');
				html = html.replace(/<\/div><p>/gi, '<p>');
				html = html.replace(/<\/p><\/div>/gi, '</p>');
				html = html.replace(/<p><\/p>/gi, '<br />');
			}
			else
			{
				html = html.replace(/<div><\/div>/gi, '<br />');
			}
			html = this.cleanStripTags(html);

			if (this.currentOrParentIs('LI'))
			{
				html = html.replace(/<p>([\w\W]*?)<\/p>/gi, '$1<br>');
			}
			else if (tablePaste === false)
			{
				html = this.cleanParagraphy(html);
			}
			html = html.replace(/<span(.*?)>([\w\W]*?)<\/span>/gi, '$2');
			html = html.replace(/<img>/gi, '');
			html = html.replace(/<[^\/>][^>][^img|param|source|td][^<]*>(\s*|\t*|\n*| |<br>)<\/[^>]+>/gi, '');

			html = html.replace(/\n{3,}/gi, '\n');
			html = html.replace(/<p><p>/gi, '<p>');
			html = html.replace(/<\/p><\/p>/gi, '</p>');

			html = html.replace(/<li>(\s*|\t*|\n*)<p>/gi, '<li>');
			html = html.replace(/<\/p>(\s*|\t*|\n*)<\/li>/gi, '</li>');

			if (this.opts.linebreaks === true)
			{
				html = html.replace(/<p(.*?)>([\w\W]*?)<\/p>/gi, '$2<br>');
			}
			html = html.replace(/<[^\/>][^>][^img|param|source|td][^<]*>(\s*|\t*|\n*| |<br>)<\/[^>]+>/gi, '');
			html = html.replace(/<img src="webkit-fake-url\:\/\/(.*?)"(.*?)>/gi, '');
			html = html.replace(/<td(.*?)>(\s*|\t*|\n*)<p>([\w\W]*?)<\/p>(\s*|\t*|\n*)<\/td>/gi, '<td$1>$3</td>');
			if (this.opts.convertDivs)
			{
				html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '$2');
				html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '$2');
			}
			this.pasteClipboardMozilla = false;
			if (this.browser('mozilla'))
			{
				if (this.opts.clipboardUpload)
				{
					var matches = html.match(/<img src="data:image(.*?)"(.*?)>/gi);
					if (matches !== null)
					{
						this.pasteClipboardMozilla = matches;
						for (var k in matches)
						{
							var img = matches[k].replace('<img', '<img data-mozilla-paste-image="' + k + '" ');
							html = html.replace(matches[k], img);
						}
					}
				}
				while (/<br>$/gi.test(html))
				{
					html = html.replace(/<br>$/gi, '');
				}
			}
			html = html.replace(/<p>•([\w\W]*?)<\/p>/gi, '<li>$1</li>');
			if (this.browser('msie'))
			{
				while (/<font>([\w\W]*?)<\/font>/gi.test(html))
				{
					html = html.replace(/<font>([\w\W]*?)<\/font>/gi, '$1');
				}
			}
			if (tablePaste === false)
			{
				html = html.replace(/<td(.*?)>([\w\W]*?)<p(.*?)>([\w\W]*?)<\/td>/gi, '<td$1>$2$4</td>');
				html = html.replace(/<td(.*?)>([\w\W]*?)<\/p>([\w\W]*?)<\/td>/gi, '<td$1>$2$3</td>');
				html = html.replace(/<td(.*?)>([\w\W]*?)<p(.*?)>([\w\W]*?)<\/td>/gi, '<td$1>$2$4</td>');
				html = html.replace(/<td(.*?)>([\w\W]*?)<\/p>([\w\W]*?)<\/td>/gi, '<td$1>$2$3</td>');
			}
			html = html.replace(/\n/g, ' ');
			html = html.replace(/<p>\n?<li>/gi, '<li>');

			this.pasteInsert(html);

		},
		pastePre: function(s)
		{
			s = s.replace(/<br>|<\/H[1-6]>|<\/p>|<\/div>/gi, '\n');

			var tmp = this.document.createElement('div');
			tmp.innerHTML = s;
			return this.cleanEncodeEntities(tmp.textContent || tmp.innerText);
		},
		pasteInsert: function(html)
		{
			html = this.callback('pasteAfter', false, html);

			if (this.selectall)
			{
				this.$editor.html(html);
				this.selectionRemove();
				this.focusEnd();
				this.sync();
			}
			else
			{
				this.insertHtml(html);
			}

			this.selectall = false;

			setTimeout($.proxy(function()
			{
				this.rtePaste = false;
				if (this.browser('mozilla'))
				{
					this.$editor.find('p:empty').remove();
				}
				if (this.pasteClipboardMozilla !== false)
				{
					this.pasteClipboardUploadMozilla();
				}

			}, this), 100);

			if (this.opts.autoresize && this.fullscreen !== true)
			{
				$(this.document.body).scrollTop(this.saveScroll);
			}
			else
			{
				this.$editor.scrollTop(this.saveScroll);
			}
		},
		pasteClipboardAppendFields: function(postData)
		{

			if (this.opts.uploadFields !== false && typeof this.opts.uploadFields === 'object')
			{
				$.each(this.opts.uploadFields, $.proxy(function(k, v)
				{
					if (v != null && v.toString().indexOf('#') === 0) v = $(v).val();
					postData[k] = v;

				}, this));
			}

			return postData;
		},
		pasteClipboardUploadMozilla: function()
		{
			var imgs = this.$editor.find('img[data-mozilla-paste-image]');
			$.each(imgs, $.proxy(function(i,s)
			{
				var $s = $(s);
				var arr = s.src.split(",");
				var postData = {
					'contentType': arr[0].split(";")[0].split(":")[1],
					'data': arr[1]
				};
				postData = this.pasteClipboardAppendFields(postData);

				$.post(this.opts.clipboardUploadUrl, postData,
				$.proxy(function(data)
				{
					var json = (typeof data === 'string' ? $.parseJSON(data) : data);
		        	$s.attr('src', json.image.url);
		        	$s.removeAttr('data-mozilla-paste-image');

		        	this.sync();
					this.callback('imageUpload', $s, json);

				}, this));

			}, this));
		},
		pasteClipboardUpload: function(e)
		{
	        var result = e.target.result;
			var arr = result.split(",");
			var postData = {
				'contentType': arr[0].split(";")[0].split(":")[1],
				'data': arr[1]
			};
			if (this.opts.clipboardUpload)
			{

				postData = this.pasteClipboardAppendFields(postData);

				$.post(this.opts.clipboardUploadUrl, postData,
				$.proxy(function(data)
				{
					var json = (typeof data === 'string' ? $.parseJSON(data) : data);

					var html = '<img src="' + json.image.url + '" id="clipboard-image-marker" />';
					this.execCommand('inserthtml', html, false);

					var image = $(this.$editor.find('img#clipboard-image-marker'));

					if (image.length) image.removeAttr('id');
					else image = false;

					this.sync();
					if (image)
					{
						this.callback('imageUpload', image, json);
					}
				}, this));
			}
			else
			{
	        	this.insertHtml('<img src="' + result + '" />');
        	}
		},
		bufferSet: function(selectionSave)
		{
			if (selectionSave !== false)
			{
				this.selectionSave();
			}

			this.opts.buffer.push(this.$editor.html());

			if (selectionSave !== false)
			{
				this.selectionRemoveMarkers('buffer');
			}

		},
		bufferUndo: function()
		{
			if (this.opts.buffer.length === 0)
			{
				this.focusWithSaveScroll();
				return;
			}
			this.selectionSave();
			this.opts.rebuffer.push(this.$editor.html());
			this.selectionRestore(false, true);

			this.$editor.html(this.opts.buffer.pop());

			this.selectionRestore();
			setTimeout($.proxy(this.observeStart, this), 100);
		},
		bufferRedo: function()
		{
			if (this.opts.rebuffer.length === 0)
			{
				this.focusWithSaveScroll();
				return false;
			}
			this.selectionSave();
			this.opts.buffer.push(this.$editor.html());
			this.selectionRestore(false, true);

			this.$editor.html(this.opts.rebuffer.pop());
			this.selectionRestore(true);
			setTimeout($.proxy(this.observeStart, this), 4);
		},
		observeStart: function()
		{
			this.observeImages();

			if (this.opts.observeLinks) this.observeLinks();
		},
		observeLinks: function()
		{
			this.$editor.find('a').on('click', $.proxy(this.linkObserver, this));

			this.$editor.on('click.redactor', $.proxy(function(e)
			{
				this.linkObserverTooltipClose(e);

			}, this));

			$(document).on('click.redactor', $.proxy(function(e)
			{
				this.linkObserverTooltipClose(e);

			}, this));
		},
		observeImages: function()
		{
			if (this.opts.observeImages === false) return false;

			this.$editor.find('img').each($.proxy(function(i, elem)
			{
				if (this.browser('msie')) $(elem).attr('unselectable', 'on');

				var parent = $(elem).parent();
				if (!parent.hasClass('royalSlider') && !parent.hasClass('fotorama'))
				{
					this.imageResize(elem);
				}

			}, this));
			this.$editor.find('.fotorama, .royalSlider').on('click', $.proxy(this.editGallery, this));

		},
		linkObserver: function(e)
		{
			var $link = $(e.target);

			var parent = $(e.target).parent();
			if (parent.hasClass('royalSlider') || parent.hasClass('fotorama'))
			{
				return;
			}

			if ($link.length == 0 || $link[0].tagName !== 'A') return;

			var pos = $link.offset();
			if (this.opts.iframe)
			{
				var posFrame = this.$frame.offset();
				pos.top = posFrame.top + (pos.top - $(this.document).scrollTop());
				pos.left += posFrame.left;
			}

			var tooltip = $('<span class="redactor-link-tooltip"></span>');

			var href = $link.attr('href');
			if (href === undefined)
			{
				href = '';
			}

			if (href.length > 24) href = href.substring(0, 24) + '...';

			var aLink = $('<a href="' + $link.attr('href') + '" target="_blank">' + href + '</a>').on('click', $.proxy(function(e)
			{
				this.linkObserverTooltipClose(false);
			}, this));

			var aEdit = $('<a href="#">' + this.opts.curLang.edit + '</a>').on('click', $.proxy(function(e)
			{
				e.preventDefault();
				this.linkShow();
				this.linkObserverTooltipClose(false);

			}, this));

			var aUnlink = $('<a href="#">' + this.opts.curLang.unlink + '</a>').on('click', $.proxy(function(e)
			{
				e.preventDefault();
				this.execCommand('unlink');
				this.linkObserverTooltipClose(false);

			}, this));
			tooltip.append(aLink);
			tooltip.append(' | ');
			tooltip.append(aEdit);
			tooltip.append(' | ');
			tooltip.append(aUnlink);
			tooltip.css({
				top: (pos.top + 20) + 'px',
				left: pos.left + 'px'
			});

			$('.redactor-link-tooltip').remove();
			$('body').append(tooltip);
		},
		linkObserverTooltipClose: function(e)
		{
			if (e !== false && e.target.tagName == 'A') return false;
			$('.redactor-link-tooltip').remove();
		},
		getSelection: function()
		{
			if (!this.opts.rangy) return this.document.getSelection();
			else
			{
				if (!this.opts.iframe) return rangy.getSelection();
				else return rangy.getSelection(this.$frame[0]);
			}
		},
		getRange: function()
		{
			if (!this.opts.rangy)
			{
				if (this.document.getSelection)
				{
					var sel = this.getSelection();
					if (sel.getRangeAt && sel.rangeCount) return sel.getRangeAt(0);
				}

				return this.document.createRange();
			}
			else
			{
				if (!this.opts.iframe) return rangy.createRange();
				else return rangy.createRange(this.iframeDoc());
			}
		},
		selectionElement: function(node)
		{
			this.setCaret(node);
		},
		selectionStart: function(node)
		{
			this.selectionSet(node[0] || node, 0, null, 0);
		},
		selectionEnd: function(node)
		{
			this.selectionSet(node[0] || node, 1, null, 1);
		},
		selectionSet: function(orgn, orgo, focn, foco)
		{
			if (focn == null) focn = orgn;
			if (foco == null) foco = orgo;

			var sel = this.getSelection();
			if (!sel) return;

			if (orgn.tagName == 'P' && orgn.innerHTML == '')
			{
				orgn.innerHTML = this.opts.invisibleSpace;
			}

			if (orgn.tagName == 'BR' && this.opts.linebreaks === false)
			{
				var par = $(this.opts.emptyHtml)[0];
				$(orgn).replaceWith(par);
				orgn = par;
				focn = orgn;
			}

			var range = this.getRange();
			range.setStart(orgn, orgo);
			range.setEnd(focn, foco );

			try {
				sel.removeAllRanges();
			} catch (e) {}

			sel.addRange(range);
		},
		selectionWrap: function(tag)
		{
			tag = tag.toLowerCase();

			var block = this.getBlock();
			if (block)
			{
				var wrapper = this.formatChangeTag(block, tag);
				this.sync();
				return wrapper;
			}

			var sel = this.getSelection();
			var range = sel.getRangeAt(0);
			var wrapper = document.createElement(tag);
			wrapper.appendChild(range.extractContents());
			range.insertNode(wrapper);

			this.selectionElement(wrapper);

			return wrapper;
		},
		selectionAll: function()
		{
			var range = this.getRange();
			range.selectNodeContents(this.$editor[0]);

			var sel = this.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		selectionRemove: function()
		{
			this.getSelection().removeAllRanges();
		},
		getCaretOffset: function (element)
		{
			var caretOffset = 0;

			var range = this.getRange();
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = $.trim(preCaretRange.toString()).length;

			return caretOffset;
		},
		getCaretOffsetRange: function()
		{
			return new Range(this.getSelection().getRangeAt(0));
		},
		setCaret: function (el, start, end)
		{
			if (typeof end === 'undefined') end = start;
			el = el[0] || el;

			var range = this.getRange();
			range.selectNodeContents(el);

			var textNodes = this.getTextNodesIn(el);
			var foundStart = false;
			var charCount = 0, endCharCount;

			if (textNodes.length == 1 && start)
			{
				range.setStart(textNodes[0], start);
				range.setEnd(textNodes[0], end);
			}
			else
			{
				for (var i = 0, textNode; textNode = textNodes[i++];)
				{
					endCharCount = charCount + textNode.length;
					if (!foundStart && start >= charCount && (start < endCharCount || (start == endCharCount && i < textNodes.length)))
					{
						range.setStart(textNode, start - charCount);
						foundStart = true;
					}

					if (foundStart && end <= endCharCount)
					{
						range.setEnd( textNode, end - charCount );
						break;
					}

					charCount = endCharCount;
				}
			}

			var sel = this.getSelection();
			sel.removeAllRanges();
			sel.addRange( range );
		},
		setCaretAfter: function(node)
		{
			this.$editor.focus();

			node = node[0] || node;

			var range = this.document.createRange()

			var start = 1;
			var end = -1;

			range.setStart(node, start)
			range.setEnd(node, end + 2)
			var selection = this.window.getSelection()
			var cursorRange = this.document.createRange()

			var emptyElement = this.document.createTextNode('\u200B')
			$(node).after(emptyElement)

			cursorRange.setStartAfter(emptyElement)

			selection.removeAllRanges()
			selection.addRange(cursorRange)
			$(emptyElement).remove();
		},
		getTextNodesIn: function (node)
		{
			var textNodes = [];

			if (node.nodeType == 3) textNodes.push(node);
			else
			{
				var children = node.childNodes;
				for (var i = 0, len = children.length; i < len; ++i)
				{
					textNodes.push.apply(textNodes, this.getTextNodesIn(children[i]));
				}
			}

			return textNodes;
		},
		getCurrent: function()
		{
			var el = false;
			var sel = this.getSelection();

			if (sel && sel.rangeCount > 0)
			{
				el = sel.getRangeAt(0).startContainer;

			}

			return this.isParentRedactor(el);
		},
		getParent: function(elem)
		{
			elem = elem || this.getCurrent();
			if (elem) return this.isParentRedactor( $( elem ).parent()[0] );
			else return false;
		},
		getBlock: function(node)
		{
			if (typeof node === 'undefined') node = this.getCurrent();

			while (node)
			{
				if (this.nodeTestBlocks(node))
				{
					if ($(node).hasClass('redactor_editor')) return false;
					return node;
				}

				node = node.parentNode;
			}

			return false;
		},
		getBlocks: function(nodes)
		{
			var newnodes = [];
			if (typeof nodes == 'undefined')
			{
				var range = this.getRange();
				if (range && range.collapsed === true) return [this.getBlock()];
				var nodes = this.getNodes(range);
			}

			$.each(nodes, $.proxy(function(i,node)
			{
				if (this.opts.iframe === false && $(node).parents('div.redactor_editor').length == 0) return false;
				if (this.nodeTestBlocks(node)) newnodes.push(node);

			}, this));

			if (newnodes.length === 0) newnodes = [this.getBlock()];

			return newnodes;
		},
		isInlineNode: function(node)
		{
			if (node.nodeType != 1) return false;

			return !this.rTestBlock.test(node.nodeName);
		},
		nodeTestBlocks: function(node)
		{
			return node.nodeType == 1 && this.rTestBlock.test(node.nodeName);
		},
		tagTestBlock: function(tag)
		{
			return this.rTestBlock.test(tag);
		},
		getNodes: function(range, tag)
		{
			if (typeof range == 'undefined' || range == false) var range = this.getRange();
			if (range && range.collapsed === true)
			{
				if (typeof tag === 'undefined' && this.tagTestBlock(tag))
				{
					var block = this.getBlock();
					if (block.tagName == tag) return [block];
					else return [];
				}
				else
				{
					return [this.getCurrent()];
				}
			}

			var nodes = [], finalnodes = [];

			var sel = this.document.getSelection();
			if (!sel.isCollapsed) nodes = this.getRangeSelectedNodes(sel.getRangeAt(0));

			$.each(nodes, $.proxy(function(i,node)
			{
				if (this.opts.iframe === false && $(node).parents('div.redactor_editor').length == 0) return false;

				if (typeof tag === 'undefined')
				{
					if ($.trim(node.textContent) != '')
					{
						finalnodes.push(node);
					}
				}
				else if (node.tagName == tag)
				{
					finalnodes.push(node);
				}

			}, this));

			if (finalnodes.length == 0)
			{
				if (typeof tag === 'undefined' && this.tagTestBlock(tag))
				{
					var block = this.getBlock();
					if (block.tagName == tag) return finalnodes.push(block);
					else return [];
				}
				else
				{
					finalnodes.push(this.getCurrent());
				}
			}
			var last = finalnodes[finalnodes.length-1];
			if (this.nodeTestBlocks(last))
			{
				finalnodes = finalnodes.slice(0, -1);
			}

			return finalnodes;
		},
		getElement: function(node)
		{
			if (!node) node = this.getCurrent();
			while (node)
			{
				if (node.nodeType == 1)
				{
					if ($(node).hasClass('redactor_editor')) return false;
					return node;
				}

				node = node.parentNode;
			}

			return false;
		},
		getRangeSelectedNodes: function(range)
		{
			range = range || this.getRange();
			var node = range.startContainer;
			var endNode = range.endContainer;

			if (node == endNode) return [node];

			var rangeNodes = [];
			while (node && node != endNode)
			{
				rangeNodes.push(node = this.nextNode(node));
			}

			node = range.startContainer;
			while (node && node != range.commonAncestorContainer)
			{
				rangeNodes.unshift(node);
				node = node.parentNode;
			}

			return rangeNodes;
		},
		nextNode: function(node)
		{
			if (node.hasChildNodes()) return node.firstChild;
			else
			{
				while (node && !node.nextSibling)
				{
					node = node.parentNode;
				}

				if (!node) return null;
				return node.nextSibling;
			}
		},
		getSelectionText: function()
		{
			return this.getSelection().toString();
		},
		getSelectionHtml: function()
		{
			var html = '';

			var sel = this.getSelection();
			if (sel.rangeCount)
			{
				var container = this.document.createElement( "div" );
				var len = sel.rangeCount;
				for (var i = 0; i < len; ++i)
				{
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}

				html = container.innerHTML;
			}

			return this.syncClean(html);
		},
		selectionSave: function()
		{
			if (!this.isFocused())
			{
				this.focusWithSaveScroll();
			}

			if (!this.opts.rangy)
			{
				this.selectionCreateMarker(this.getRange());
			}

			else
			{
				this.savedSel = rangy.saveSelection();
			}
		},
		selectionCreateMarker: function(range, remove)
		{
			if (!range) return;

			var node1 = $('<span id="selection-marker-1" class="redactor-selection-marker">' + this.opts.invisibleSpace + '</span>', this.document)[0];
			var node2 = $('<span id="selection-marker-2" class="redactor-selection-marker">' + this.opts.invisibleSpace + '</span>', this.document)[0];

			if (range.collapsed === true)
			{
				this.selectionSetMarker(range, node1, true);
			}
			else
			{
				this.selectionSetMarker(range, node1, true);
				this.selectionSetMarker(range, node2, false);
			}

			this.savedSel = this.$editor.html();

			this.selectionRestore(false, false);
		},
		selectionSetMarker: function(range, node, type)
		{
			var boundaryRange = range.cloneRange();

			try {
				boundaryRange.collapse(type);
				boundaryRange.insertNode(node);
				boundaryRange.detach();
			}
			catch (e)
			{
				var html = this.opts.emptyHtml;
				if (this.opts.linebreaks) html = '<br>';

				this.$editor.prepend(html);
				this.focus();
			}
		},
		selectionRestore: function(replace, remove)
		{
			if (!this.opts.rangy)
			{
				if (replace === true && this.savedSel)
				{
					this.$editor.html(this.savedSel);
				}

				var node1 = this.$editor.find('span#selection-marker-1');
				var node2 = this.$editor.find('span#selection-marker-2');

				if (this.browser('mozilla'))
				{
					this.$editor.focus();
				}
				else if (!this.isFocused())
				{
					this.focusWithSaveScroll();
				}

				if (node1.length != 0 && node2.length != 0)
				{

					this.selectionSet(node1[0], 0, node2[0], 0);
				}
				else if (node1.length != 0)
				{
					this.selectionSet(node1[0], 0, null, 0);
				}

				if (remove !== false)
				{
					this.selectionRemoveMarkers();
					this.savedSel = false;
				}
			}

			else
			{
				rangy.restoreSelection(this.savedSel);
			}
		},
		selectionRemoveMarkers: function(type)
		{
			if (!this.opts.rangy)
			{
				$.each(this.$editor.find('span.redactor-selection-marker'), function()
				{
					var html = $.trim($(this).html().replace(/[^\u0000-\u1C7F]/g, ''));
					if (html == '')
					{
						$(this).remove();
					}
					else
					{
						$(this).removeAttr('class').removeAttr('id');
					}
				});
			}

			else
			{
				rangy.removeMarkers(this.savedSel);
			}
		},
		tableShow: function()
		{
			this.selectionSave();

			this.modalInit(this.opts.curLang.table, this.opts.modal_table, 300, $.proxy(function()
			{
				$('#redactor_insert_table_btn').on('click', $.proxy(this.tableInsert, this));

				setTimeout(function()
				{
					$('#redactor_table_rows').focus();

				}, 200);

			}, this));
		},
		tableInsert: function()
		{
			this.bufferSet(false);

			var rows = $('#redactor_table_rows').val(),
				columns = $('#redactor_table_columns').val(),
				$table_box = $('<div></div>'),
				tableId = Math.floor(Math.random() * 99999),
				$table = $('<table id="table' + tableId + '"><tbody></tbody></table>'),
				i, $row, z, $column;

			for (i = 0; i < rows; i++)
			{
				$row = $('<tr></tr>');

				for (z = 0; z < columns; z++)
				{
					$column = $('<td>' + this.opts.invisibleSpace + '</td>');
					if (i === 0 && z === 0)
					{
						$column.append('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
					}

					$($row).append($column);
				}

				$table.append($row);
			}

			$table_box.append($table);
			var html = $table_box.html();

			if (this.opts.linebreaks === false && this.browser('mozilla'))
			{
				html += '<p>' + this.opts.invisibleSpace + '</p>';
			}

			this.modalClose();
			this.selectionRestore();

			var current = this.getBlock() || this.getCurrent();

			if (current && current.tagName != 'BODY')
			{
				if (current.tagName == 'LI')
				{
					var current = $(current).closest('ul, ol');
				}

				$(current).after(html)
			}
			else
			{

				this.insertHtmlAdvanced(html, false);
			}

			this.selectionRestore();

			var table = this.$editor.find('#table' + tableId);
			this.buttonActiveObserver();

			table.find('span#selection-marker-1, inline#selection-marker-1').remove();
			table.removeAttr('id');

			this.sync();
		},
		tableDeleteTable: function()
		{
			var $table = $(this.getParent()).closest('table');
			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			$table.remove();
			this.sync();
		},
		tableDeleteRow: function()
		{
			var parent = this.getParent();
			var $table = $(parent).closest('table');
			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			var $current_tr = $(parent).closest('tr');
			var $focus_tr = $current_tr.prev().length ? $current_tr.prev() : $current_tr.next();
			if ($focus_tr.length)
			{
				var $focus_td = $focus_tr.children('td' ).first();
				if ($focus_td.length)
				{
					$focus_td.prepend('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
				}
			}

			$current_tr.remove();
			this.selectionRestore();
			$table.find('span#selection-marker-1').remove();
			this.sync();
		},
		tableDeleteColumn: function()
		{
			var parent = this.getParent();
			var $table = $(parent).closest('table');

			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			var $current_td = $(parent).closest('td');
			if (!($current_td.is('td')))
			{
				$current_td = $current_td.closest('td');
			}

			var index = $current_td.get(0).cellIndex;
			$table.find('tr').each($.proxy(function(i, elem)
			{
				var focusIndex = index - 1 < 0 ? index + 1 : index - 1;
				if (i === 0)
				{
					$(elem).find('td').eq(focusIndex).prepend('<span id="selection-marker-1">' + this.opts.invisibleSpace + '</span>');
				}

				$(elem).find('td').eq(index).remove();

			}, this));

			this.selectionRestore();
			$table.find('span#selection-marker-1').remove();
			this.sync();
		},
		tableAddHead: function()
		{
			var $table = $(this.getParent()).closest('table');
			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			if ($table.find('thead').length !== 0) this.tableDeleteHead();
			else
			{
				var tr = $table.find('tr').first().clone();
				tr.find('td').replaceWith('<th></th>').html(this.opts.invisibleSpace);
				$thead = $('<thead></thead>');
				$thead.append(tr);
				$table.prepend($thead);

				this.sync();
			}
		},
		tableDeleteHead: function()
		{
			var $table = $(this.getParent()).closest('table');
			if (!this.isParentRedactor($table)) return false;
			var $thead = $table.find('thead');

			if ($thead.length == 0) return false;

			this.bufferSet();

			$thead.remove();
			this.sync();
		},
		tableAddRowAbove: function()
		{
			this.tableAddRow('before');
		},
		tableAddRowBelow: function()
		{
			this.tableAddRow('after');
		},
		tableAddColumnLeft: function()
		{
			this.tableAddColumn('before');
		},
		tableAddColumnRight: function()
		{
			this.tableAddColumn('after');
		},
		tableAddRow: function(type)
		{
			var $table = $(this.getParent()).closest('table');
			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			var $current_tr = $(this.getParent()).closest('tr');
			var new_tr = $current_tr.clone();
			new_tr.find('td').html(this.opts.invisibleSpace);

			if (type === 'after') $current_tr.after(new_tr);
			else $current_tr.before(new_tr);

			this.sync();
		},
		tableAddColumn: function (type)
		{
			var parent = this.getParent();
			var $table = $(parent).closest('table');

			if (!this.isParentRedactor($table)) return false;
			if ($table.length == 0) return false;

			this.bufferSet();

			var index = 0;

			var current = this.getCurrent();
			var $current_tr = $(current).closest('tr');
			var $current_td =  $(current).closest('td');

			$current_tr.find('td').each($.proxy(function(i, elem)
			{
				if ($(elem)[0] === $current_td[0]) index = i;

			}, this));

			$table.find('tr').each($.proxy(function(i, elem)
			{
				var $current = $(elem).find('td').eq(index);

				var td = $current.clone();
				td.html(this.opts.invisibleSpace);

				type === 'after' ? $current.after(td) : $current.before(td);

			}, this));

			this.sync();
		},
		videoShow: function()
		{
			this.selectionSave();

			this.modalInit(this.opts.curLang.video, this.opts.modal_video, 600, $.proxy(function()
			{
				$('#redactor_insert_video_btn').on('click', $.proxy(this.videoInsert, this));

				setTimeout(function()
				{
					$('#redactor_insert_video_area').focus();

				}, 200);

			}, this));
		},
		videoInsert: function ()
		{
			var data = $('#redactor_insert_video_area').val();
			data = this.cleanStripTags(data);
			var iframeStart = '<iframe width="500" height="281" src="',
				iframeEnd = '" frameborder="0" allowfullscreen></iframe>';

			if (data.match(reUrlYoutube))
			{
				data = data.replace(reUrlYoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
			}
			else if (data.match(reUrlVimeo))
			{
				data = data.replace(reUrlVimeo, iframeStart + '//player.vimeo.com/video/$2' + iframeEnd);
			}
            else if (data.match(reUrlFacebook))
            {
                data = data.replace(reUrlFacebook, iframeStart + 'https://www.facebook.com/video/embed?video_id=$1' + iframeEnd);
            }
			else if (data.match(reUrlRutube))
            {
                data = data.replace(reUrlRutube, iframeStart + '//rutube.ru/play/embed/$1' + iframeEnd);
            }

			this.selectionRestore();

			var current = this.getBlock() || this.getCurrent();

			if (current) $(current).after(data)
			else this.insertHtmlAdvanced(data, false);

			this.sync();
			this.modalClose();
		},

		linkShow: function()
		{
			this.selectionSave();

			var callback = $.proxy(function()
			{

				if (this.opts.predefinedLinks !== false)
				{
					this.predefinedLinksStorage = {};
					var that = this;
					$.getJSON(this.opts.predefinedLinks, function(data)
					{
                        if(Object.keys(data).length === 0){ return; }
						var $select = $('#redactor-predefined-links');
						$select .html('');
						$.each(data, function(key, val)
						{
							that.predefinedLinksStorage[key] = val;
							$select.append($('<option>').val(key).html(val.name));
						});

						$select.on('change', function()
						{
							var key = $(this).val();
							var name = '', url = '';
							if (key != 0)
							{
								name = that.predefinedLinksStorage[key].name;
								url = that.predefinedLinksStorage[key].url;
							}

							$('#redactor_link_url').val(url);
                            if($('#redactor_link_url_text').data('is_selected_text') != 1){
                                $('#redactor_link_url_text').val(name);
                            }
						});

						$select.show();
					});
				}

				this.insert_link_node = false;

				var sel = this.getSelection();
				var url = '', text = '', target = '';

				var elem = this.getParent();
				var par = $(elem).parent().get(0);
				if (par && par.tagName === 'A')
				{
					elem = par;
				}

				if (elem && elem.tagName === 'A')
				{
					url = elem.href;
					text = $(elem).text();
					target = elem.target;

					this.insert_link_node = elem;
				}
				else text = sel.toString();

				$('#redactor_link_url_text').val(text);
                if(text.length > 0){
                    $('#redactor_link_url_text').data('is_selected_text', 1);
                }

				var thref = self.location.href.replace(/\/$/i, '');
				url = url.replace(thref, '');
				url = url.replace(/^\/#/, '#');
				url = url.replace('mailto:', '');
				if (this.opts.linkProtocol === false)
				{
					var re = new RegExp('^(http|ftp|https)://' + self.location.host, 'i');
					url = url.replace(re, '');
				}
				$('#redactor_link_url').val(url);

				if (target === '_blank')
				{
					$('#redactor_link_blank').prop('checked', true);
				}

				this.linkInsertPressed = false;
				$('#redactor_insert_link_btn').on('click', $.proxy(this.linkProcess, this));
				setTimeout(function()
				{
					$('#redactor_link_url').focus();

				}, 200);

			}, this);

			this.modalInit(this.opts.curLang.link, this.opts.modal_link, 460, callback);

		},
		linkProcess: function()
		{
			if (this.linkInsertPressed)
			{
				return;
			}

			this.linkInsertPressed = true;
			var target = '', targetBlank = '';

			var link = $('#redactor_link_url').val();
			var text = $('#redactor_link_url_text').val();
			if (link.search('@') != -1 && /(http|ftp|https):\/\//i.test(link) === false)
			{
				link = 'mailto:' + link;
			}

			else if (link.search('#') != 0)
			{
				if ($('#redactor_link_blank').prop('checked'))
				{
					target = ' target="_blank"';
					targetBlank = '_blank';
				}
				var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}';
				var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
				var re2 = new RegExp('^' + pattern, 'i');

				if (link.search(re) == -1 && link.search(re2) == 0 && this.opts.linkProtocol)
				{
					link = this.opts.linkProtocol + link;
				}
			}

			text = text.replace(/<|>/g, '');
			var extra = '&nbsp;';
			if (this.browser('mozilla'))
			{
				extra = '&nbsp;';
			}

			this.linkInsert('<a href="' + link + '"' + target + '>' + text + '</a>' + extra, $.trim(text), link, targetBlank);

		},
		linkInsert: function (a, text, link, target)
		{
			this.selectionRestore();

			if (text !== '')
			{
				if (this.insert_link_node)
				{
					this.bufferSet();

					$(this.insert_link_node).text(text).attr('href', link);

					if (target !== '')
					{
						$(this.insert_link_node).attr('target', target);
					}
					else
					{
						$(this.insert_link_node).removeAttr('target');
					}
				}
				else
				{
					var $a = $(a).addClass('redactor-added-link');
					this.exec('inserthtml', this.outerHtml($a), false);

					var link = this.$editor.find('a.redactor-added-link');

					link.removeAttr('style').removeClass('redactor-added-link').each(function()
					{
						if (this.className == '') $(this).removeAttr('class');
					});

				}

				this.sync();
			}
			setTimeout($.proxy(function()
			{
				if (this.opts.observeLinks) this.observeLinks();

			}, this), 5);

			this.modalClose();
		},
		fileShow: function ()
		{

			this.selectionSave();

			var callback = $.proxy(function()
			{
				var sel = this.getSelection();

				var text = '';
				if (this.oldIE()) text = sel.text;
				else text = sel.toString();

				$('#redactor_filename').val(text);
				if (!this.isMobile() && !this.isIPad())
				{
					this.draguploadInit('#redactor_file', {
						url: this.opts.fileUpload,
						uploadFields: this.opts.uploadFields,
						success: $.proxy(this.fileCallback, this),
						error: $.proxy( function(obj, json)
						{
							this.callback('fileUploadError', json);

						}, this),
						uploadParam: this.opts.fileUploadParam
					});
				}

				this.uploadInit('redactor_file', {
					auto: true,
					url: this.opts.fileUpload,
					success: $.proxy(this.fileCallback, this),
					error: $.proxy(function(obj, json)
					{
						this.callback('fileUploadError', json);

					}, this)
				});

			}, this);

			this.modalInit(this.opts.curLang.file, this.opts.modal_file, 500, callback);
		},
		fileCallback: function(json)
		{

			this.selectionRestore();

			if (json !== false)
			{

				var text = $('#redactor_filename').val();
				if (text === '') text = json.filename;

				var link = '<a href="' + json.filelink + '" id="filelink-marker">' + text + '</a>';
				if (this.browser('webkit') && !!this.window.chrome)
				{
					link = link + '&nbsp;';
				}

				this.execCommand('inserthtml', link, false);

				var linkmarker = $(this.$editor.find('a#filelink-marker'));
				if (linkmarker.length != 0) linkmarker.removeAttr('id');
				else linkmarker = false;

				this.sync();
				this.callback('fileUpload', linkmarker, json);
			}

			this.modalClose();
		},
		imageShow: function()
		{

			this.selectionSave();

			var callback = $.proxy(function()
			{

				if (this.opts.imageGetJson)
				{

					$.getJSON(this.opts.imageGetJson, $.proxy(function(data)
					{
                        if(data.error){
                            alert(data.message); return;
                        }
						var folders = {}, count = 0;
						$.each(data, $.proxy(function(key, val)
						{
							if (typeof val.folder !== 'undefined')
							{
								count++;
								folders[val.folder] = count;
							}

						}, this));

                        $('#redactor_image_box .empty_list').show();
						var folderclass = false;
						$.each(data, $.proxy(function(key, val)
						{

							var thumbtitle = '';
							if (typeof val.title !== 'undefined') thumbtitle = val.title;

							var folderkey = 0;
							if (!$.isEmptyObject(folders) && typeof val.folder !== 'undefined')
							{
								folderkey = folders[val.folder];
								if (folderclass === false) folderclass = '.redactorfolder' + folderkey;
							}

							var img = $('<img src="' + val.thumb + '" class="redactorfolder redactorfolder' + folderkey + '" rel="' + val.image + '" title="' + thumbtitle + '" />');
							$('#redactor_image_box').append(img);
							$(img).on('click', $.proxy(this.imageThumbClick, this));
                            $('#redactor_image_box .empty_list').hide();
						}, this));
						if (!$.isEmptyObject(folders))
						{
							$('.redactorfolder').hide();
							$(folderclass).show();

							var onchangeFunc = function(e)
							{
								$('.redactorfolder').hide();
								$('.redactorfolder' + $(e.target).val()).show();
							};

							var select = $('<select id="redactor_image_box_select">');
							$.each( folders, function(k, v)
							{
								select.append( $('<option value="' + v + '">' + k + '</option>'));
							});

							$('#redactor_image_box').before(select);
							select.change(onchangeFunc);
						}
					}, this));

				}
				else
				{
					$('#redactor-tab-control-2').remove();
				}

				if (this.opts.imageUpload || this.opts.s3)
				{

					if (!this.isMobile()  && !this.isIPad() && this.opts.s3 === false)
					{
						if ($('#redactor_file' ).length)
						{
							this.draguploadInit('#redactor_file', {
								url: this.opts.imageUpload,
								uploadFields: this.opts.uploadFields,
								success: $.proxy(this.imageCallback, this),
								error: $.proxy(function(obj, json)
								{
									this.callback('imageUploadError', json);

								}, this),
								uploadParam: this.opts.imageUploadParam
							});
						}
					}

					if (this.opts.s3 === false)
					{

						this.uploadInit('redactor_file', {
							auto: true,
							url: this.opts.imageUpload,
							success: $.proxy(this.imageCallback, this),
							error: $.proxy(function(obj, json)
							{
								this.callback('imageUploadError', json);

							}, this)
						});
					}

					else
					{
						$('#redactor_file').on('change.redactor', $.proxy(this.s3handleFileSelect, this));
					}

				}
				else
				{
					$('.redactor_tab').hide();
					if (!this.opts.imageGetJson)
					{
						$('#redactor_tabs').remove();
						$('#redactor_tab3').show();
					}
					else
					{
						$('#redactor-tab-control-1').remove();
						$('#redactor-tab-control-2').addClass('redactor_tabs_act');
						$('#redactor_tab2').show();
					}
				}

				if (!this.opts.imageTabLink && (this.opts.imageUpload || this.opts.imageGetJson))
				{
					$('#redactor-tab-control-3').hide();
				}

				$('#redactor_upload_btn').on('click', $.proxy(this.imageCallbackLink, this));

				if (!this.opts.imageUpload && !this.opts.imageGetJson)
				{
					setTimeout(function()
					{
						$('#redactor_file_link').focus();

					}, 200);
				}

			}, this);

			this.modalInit(this.opts.curLang.image, this.opts.modal_image, 610, callback);

		},
		imageEdit: function(image)
		{
			var $el = image;
			var parent = $el.parent().parent();

			var callback = $.proxy(function()
			{
				$('#redactor_file_alt').val($el.attr('alt'));
				$('#redactor_image_edit_src').attr('href', $el.attr('src'));

				if ($el.css('display') == 'block' && $el.css('float') == 'none')
				{
					$('#redactor_form_image_align').val('center');
				}
				else
				{
					$('#redactor_form_image_align').val($el.css('float'));
				}

				if ($(parent).get(0).tagName === 'A')
				{
					$('#redactor_file_link').val($(parent).attr('href'));

					if ($(parent).attr('target') == '_blank')
					{
						$('#redactor_link_blank').prop('checked', true);
					}
				}

				$('#redactor_image_delete_btn').on('click', $.proxy(function()
				{
					this.imageRemove($el);

				}, this));

				$('#redactorSaveBtn').on('click', $.proxy(function()
				{
					this.imageSave($el);

				}, this));

			}, this);

			this.modalInit(this.opts.curLang.edit, this.opts.modal_image_edit, 380, callback);

		},
		imageRemove: function(el)
		{
			var parentLink = $(el).parent().parent();
			var parent = $(el).parent();
			var parentEl = false;

			if (parentLink.length && parentLink[0].tagName === 'A')
			{
				parentEl = true;
				$(parentLink).remove();
			}
			else if (parent.length && parent[0].tagName === 'A')
			{
				parentEl = true;
				$(parent).remove();
			}
			else
			{
				$(el).remove();
			}

			if (parent.length && parent[0].tagName === 'P')
			{
				this.focusWithSaveScroll();

				if (parentEl === false) this.selectionStart(parent);
			}
			this.callback('imageDelete', el);

			this.modalClose();
			this.sync();
		},
		imageSave: function(el)
		{
			this.imageResizeHide(false);

			var $el = $(el);
			var parent = $el.parent();

			$el.attr('alt', $('#redactor_file_alt').val());

			var floating = $('#redactor_form_image_align').val();
			var margin = '';

			if (floating === 'left')
			{
				margin = '0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin + ' 0';
				$el.css({ 'float': 'left', 'margin': margin });
			}
			else if (floating === 'right')
			{
				margin = '0 0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin + '';
				$el.css({ 'float': 'right', 'margin': margin });
			}
			else if (floating === 'center')
			{
				$el.css({ 'float': '', 'display': 'block', 'margin': 'auto' });
			}
			else
			{
				$el.css({ 'float': '', 'display': '', 'margin': '' });
			}
			var link = $.trim($('#redactor_file_link').val());
			if (link !== '')
			{
				var target = false;
				if ($('#redactor_link_blank').prop('checked'))
				{
					target = true;
				}

				if (parent.get(0).tagName !== 'A')
				{
					var a = $('<a href="' + link + '">' + this.outerHtml(el) + '</a>');

					if (target)
					{
						a.attr('target', '_blank');
					}

					$el.replaceWith(a);
				}
				else
				{
					parent.attr('href', link);
					if (target)
					{
						parent.attr('target', '_blank');
					}
					else
					{
						parent.removeAttr('target');
					}
				}
			}
			else
			{
				if (parent.get(0).tagName === 'A')
				{
					parent.replaceWith(this.outerHtml(el));
				}
			}

			this.modalClose();
			this.observeImages();
			this.sync();

		},
		imageResizeHide: function(e)
		{
			if (e !== false && $(e.target).parent().length != 0 && $(e.target).parent()[0].id === 'redactor-image-box')
			{
				return false;
			}

			var imageBox = this.$editor.find('#redactor-image-box');
			if (imageBox.length == 0)
			{
				return false;
			}

			this.$editor.find('#redactor-image-editter, #redactor-image-resizer').remove();

			imageBox.find('img').css({
				marginTop: imageBox[0].style.marginTop,
				marginBottom: imageBox[0].style.marginBottom,
				marginLeft: imageBox[0].style.marginLeft,
				marginRight: imageBox[0].style.marginRight
			});

			imageBox.css('margin', '');
			imageBox.find('img').css('opacity', '');
			imageBox.replaceWith(function()
			{
				return $(this).contents();
			});

			$(document).off('click.redactor-image-resize-hide');
			this.$editor.off('click.redactor-image-resize-hide');
			this.$editor.off('keydown.redactor-image-delete');

			this.sync()

		},
		imageResize: function(image)
		{
			var $image = $(image);

			$image.on('mousedown', $.proxy(function()
			{
				this.imageResizeHide(false);
			}, this));

			$image.on('dragstart', $.proxy(function()
			{
				this.$editor.on('drop.redactor-image-inside-drop', $.proxy(function()
				{
					setTimeout($.proxy(function()
					{
						this.observeImages();
						this.$editor.off('drop.redactor-image-inside-drop');
						this.sync();

					}, this), 1);

				},this));
			}, this));

			$image.on('click', $.proxy(function(e)
			{
				if (this.$editor.find('#redactor-image-box').length != 0)
				{
					return false;
				}

				var clicked = false,
				start_x,
				start_y,
				ratio = $image.width() / $image.height(),
				min_w = 20,
				min_h = 10;

				var imageResizer = this.imageResizeControls($image);
				var isResizing = false;
				if (imageResizer !== false)
				{
					imageResizer.on('mousedown', function(e)
					{
						isResizing = true;
						e.preventDefault();

						ratio = $image.width() / $image.height();

						start_x = Math.round(e.pageX - $image.eq(0).offset().left);
						start_y = Math.round(e.pageY - $image.eq(0).offset().top);

					});

					$(this.document.body).on('mousemove', $.proxy(function(e)
					{
						if (isResizing)
						{
							var mouse_x = Math.round(e.pageX - $image.eq(0).offset().left) - start_x;
							var mouse_y = Math.round(e.pageY - $image.eq(0).offset().top) - start_y;

							var div_h = $image.height();

							var new_h = parseInt(div_h, 10) + mouse_y;
							var new_w = Math.round(new_h * ratio);

							if (new_w > min_w)
							{
								$image.width(new_w);

								if (new_w < 100)
								{
									this.imageEditter.css({
										marginTop: '-7px',
										marginLeft: '-13px',
										fontSize: '9px',
										padding: '3px 5px'
									});
								}
								else
								{
									this.imageEditter.css({
										marginTop: '-11px',
										marginLeft: '-18px',
										fontSize: '11px',
										padding: '7px 10px'
									});
								}
							}

							start_x = Math.round(e.pageX - $image.eq(0).offset().left);
							start_y = Math.round(e.pageY - $image.eq(0).offset().top);

							this.sync()
						}
					}, this)).on('mouseup', function()
					{
						isResizing = false;
					});
				}
				this.$editor.on('keydown.redactor-image-delete', $.proxy(function(e)
				{
					var key = e.which;

					if (this.keyCode.BACKSPACE == key || this.keyCode.DELETE == key)
					{
						this.bufferSet(false);
						this.imageResizeHide(false);
						this.imageRemove($image);
					}

				}, this));

				$(document).on('click.redactor-image-resize-hide', $.proxy(this.imageResizeHide, this));
				this.$editor.on('click.redactor-image-resize-hide', $.proxy(this.imageResizeHide, this));
			}, this));
		},
		imageResizeControls: function($image)
		{
			var imageBox = $('<span id="redactor-image-box" data-redactor="verified">');
			imageBox.css({
				position: 'relative',
				display: 'inline-block',
				lineHeight: 0,
				outline: '1px dashed rgba(0, 0, 0, .6)',
				'float': $image.css('float')
			});
			imageBox.attr('contenteditable', false);

			if ($image[0].style.margin != 'auto')
			{
				imageBox.css({
					marginTop: $image[0].style.marginTop,
					marginBottom: $image[0].style.marginBottom,
					marginLeft: $image[0].style.marginLeft,
					marginRight: $image[0].style.marginRight
				});

				$image.css('margin', '');
			}
			else
			{
				imageBox.css({ 'display': 'block', 'margin': 'auto' });
			}

			$image.css('opacity', .5).after(imageBox);
			this.imageEditter = $('<span id="redactor-image-editter" data-redactor="verified">' + this.opts.curLang.edit + '</span>');
			this.imageEditter.css({
				position: 'absolute',
				zIndex: 5,
				top: '50%',
				left: '50%',
				marginTop: '-11px',
				marginLeft: '-18px',
				lineHeight: 1,
				backgroundColor: '#000',
				color: '#fff',
				fontSize: '11px',
				padding: '7px 10px',
				cursor: 'pointer'
			});
			this.imageEditter.attr('contenteditable', false);
			this.imageEditter.on('click', $.proxy(function()
			{
				this.imageEdit($image);
			}, this));
			imageBox.append(this.imageEditter);
			if (this.opts.imageResizable)
			{
				var imageResizer = $('<span id="redactor-image-resizer" data-redactor="verified"></span>');
				imageResizer.css({
					position: 'absolute',
					zIndex: 2,
					lineHeight: 1,
					cursor: 'nw-resize',
					bottom: '-4px',
					right: '-5px',
					border: '1px solid #fff',
					backgroundColor: '#000',
					width: '8px',
					height: '8px'
				});
				imageResizer.attr('contenteditable', false);
				imageBox.append(imageResizer);

				imageBox.append($image);

				return imageResizer;
			}
			else
			{
				imageBox.append($image);

				return false;
			}
		},
		imageThumbClick: function(e)
		{
			var img = '<img id="image-marker" src="' + $(e.target).attr('rel') + '" alt="' + $(e.target).attr('title') + '" />';

			var parent = this.getParent();
			if (this.opts.paragraphy && $(parent).closest('li').length == 0) img = '<p>' + img + '</p>';

			this.imageInsert(img, true);
		},
		imageCallbackLink: function()
		{
			var val = $('#redactor_file_link').val();

			if (val !== '')
			{
				var data = '<img id="image-marker" src="' + val + '" />';
				if (this.opts.linebreaks === false) data = '<p>' + data + '</p>';

				this.imageInsert(data, true);

			}
			else this.modalClose();
		},
		imageCallback: function(data)
		{
			this.imageInsert(data);
		},
		imageInsert: function(json, link)
		{
			this.selectionRestore();

			if (json !== false)
			{
				var html = '';
				if (link !== true)
				{
					html = '<img id="image-marker" src="' + json.image.url + '" />';

					var parent = this.getParent();
					if (this.opts.paragraphy && $(parent).closest('li').length == 0)
					{
						html = '<p>' + html + '</p>';
					}
				}
				else
				{
					html = json;
				}

				this.execCommand('inserthtml', html, false);

				var image = $(this.$editor.find('img#image-marker'));

				if (image.length) image.removeAttr('id');
				else image = false;

				this.sync();
				link !== true && this.callback('imageUpload', image, json);
			}

			this.modalClose();
			this.observeImages();
		},
		buildProgressBar: function()
		{
			if ($('#redactor-progress').length != 0) return;

			this.$progressBar = $('<div id="redactor-progress"><span></span></div>');
			$(document.body).append(this.$progressBar);
		},
		showProgressBar: function()
		{
			this.buildProgressBar();
			$('#redactor-progress').fadeIn();
		},
		hideProgressBar: function()
		{
			$('#redactor-progress').fadeOut(1500);
		},
		modalTemplatesInit: function()
		{
			$.extend( this.opts,
			{
				modal_file: String()
				+ '<section id="redactor-modal-file-insert">'
					+ '<form id="redactorUploadFileForm" method="post" action="" enctype="multipart/form-data">'
						+ '<label>' + this.opts.curLang.filename + '</label>'
						+ '<input type="text" id="redactor_filename" class="redactor_input" />'
						+ '<div style="margin-top: 7px;">'
							+ '<input type="file" id="redactor_file" name="' + this.opts.fileUploadParam + '" />'
						+ '</div>'
					+ '</form>'
				+ '</section>',

				modal_image_edit: String()
				+ '<section id="redactor-modal-image-edit">'
					+ '<label>' + this.opts.curLang.title + '</label>'
					+ '<input type="text" id="redactor_file_alt" class="redactor_input" />'
					+ '<label>' + this.opts.curLang.link + '</label>'
					+ '<input type="text" id="redactor_file_link" class="redactor_input" />'
					+ '<label><input type="checkbox" id="redactor_link_blank"> ' + this.opts.curLang.link_new_tab + '</label>'
					+ '<label>' + this.opts.curLang.image_position + '</label>'
					+ '<select id="redactor_form_image_align">'
						+ '<option value="none">' + this.opts.curLang.none + '</option>'
						+ '<option value="left">' + this.opts.curLang.left + '</option>'
						+ '<option value="center">' + this.opts.curLang.center + '</option>'
						+ '<option value="right">' + this.opts.curLang.right + '</option>'
					+ '</select>'
				+ '</section>'
				+ '<footer>'
					+ '<button id="redactor_image_delete_btn" class="redactor_modal_btn redactor_modal_delete_btn">' + this.opts.curLang._delete + '</button>'
					+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
					+ '<button id="redactorSaveBtn" class="redactor_modal_btn redactor_modal_action_btn">' + this.opts.curLang.save + '</button>'
				+ '</footer>',

				modal_image: String()
				+ '<section id="redactor-modal-image-insert">'
					+ '<div id="redactor_tabs">'
						+ '<a href="#" id="redactor-tab-control-1" class="redactor_tabs_act">' + this.opts.curLang.upload + '</a>'
						+ '<a href="#" id="redactor-tab-control-2">' + this.opts.curLang.choose + '</a>'
						+ '<a href="#" id="redactor-tab-control-3">' + this.opts.curLang.link + '</a>'
					+ '</div>'
					+ '<form id="redactorInsertImageForm" method="post" action="" enctype="multipart/form-data">'
						+ '<div id="redactor_tab1" class="redactor_tab">'
							+ '<input type="file" id="redactor_file" name="' + this.opts.imageUploadParam + '" />'
						+ '</div>'
						+ '<div id="redactor_tab2" class="redactor_tab" style="display: none;">'
							+ '<div id="redactor_image_box"><span class="empty_list">' + this.opts.curLang.empty_img_list + '</span></div>'
						+ '</div>'
					+ '</form>'
					+ '<div id="redactor_tab3" class="redactor_tab" style="display: none;">'
						+ '<label>' + this.opts.curLang.image_web_link + '</label>'
						+ '<input type="text" name="redactor_file_link" id="redactor_file_link" class="redactor_input"  /><br><br>'
					+ '</div>'
				+ '</section>'
				+ '<footer>'
					+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
					+ '<button class="redactor_modal_btn redactor_modal_action_btn" id="redactor_upload_btn">' + this.opts.curLang.insert + '</button>'
				+ '</footer>',

				modal_link: String()
				+ '<section id="redactor-modal-link-insert">'
					+ '<select id="redactor-predefined-links" style="width: 99.5%; display: none;"></select>'
					+ '<label>URL</label>'
					+ '<input type="text" class="redactor_input" id="redactor_link_url" />'
					+ '<label>' + this.opts.curLang.text + '</label>'
					+ '<input type="text" class="redactor_input" id="redactor_link_url_text" />'
					+ '<label><input type="checkbox" id="redactor_link_blank"> ' + this.opts.curLang.link_new_tab + '</label>'
				+ '</section>'
				+ '<footer>'
					+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
					+ '<button id="redactor_insert_link_btn" class="redactor_modal_btn redactor_modal_action_btn">' + this.opts.curLang.insert + '</button>'
				+ '</footer>',

				modal_table: String()
				+ '<section id="redactor-modal-table-insert">'
					+ '<label>' + this.opts.curLang.rows + '</label>'
					+ '<input type="text" size="5" value="2" id="redactor_table_rows" />'
					+ '<label>' + this.opts.curLang.columns + '</label>'
					+ '<input type="text" size="5" value="3" id="redactor_table_columns" />'
				+ '</section>'
				+ '<footer>'
					+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
					+ '<button id="redactor_insert_table_btn" class="redactor_modal_btn redactor_modal_action_btn">' + this.opts.curLang.insert + '</button>'
				+ '</footer>',

				modal_video: String()
				+ '<section id="redactor-modal-video-insert">'
					+ '<form id="redactorInsertVideoForm">'
						+ '<label>' + this.opts.curLang.video_html_code + '</label>'
						+ '<textarea id="redactor_insert_video_area" style="width: 99%; height: 160px;"></textarea>'
					+ '</form>'
				+ '</section>'
				+ '<footer>'
					+ '<button class="redactor_modal_btn redactor_btn_modal_close">' + this.opts.curLang.cancel + '</button>'
					+ '<button id="redactor_insert_video_btn" class="redactor_modal_btn redactor_modal_action_btn">' + this.opts.curLang.insert + '</button>'
				+ '</footer>'

			});
		},
		modalInit: function(title, content, width, callback)
		{
			this.modalSetOverlay();

			this.$redactorModalWidth = width;
			this.$redactorModal = $('#redactor_modal');

			if (!this.$redactorModal.length)
			{
				this.$redactorModal = $('<div id="redactor_modal" style="display: none;" />');
				this.$redactorModal.append($('<div id="redactor_modal_close">&times;</div>'));
				this.$redactorModal.append($('<header id="redactor_modal_header" />'));
				this.$redactorModal.append($('<div id="redactor_modal_inner" />'));
				this.$redactorModal.appendTo(document.body);
			}

			$('#redactor_modal_close').on('click', $.proxy(this.modalClose, this));
			$(document).on('keyup', $.proxy(this.modalCloseHandler, this));
			this.$editor.on('keyup', $.proxy(this.modalCloseHandler, this));

			this.modalSetContent(content);
			this.modalSetTitle(title);
			this.modalSetDraggable();
			this.modalLoadTabs();
			this.modalOnCloseButton();
			this.modalSetButtonsWidth();

			this.saveModalScroll = this.document.body.scrollTop;
			if (this.opts.autoresize === false)
			{
				this.saveModalScroll = this.$editor.scrollTop();
			}

			if (this.isMobile() === false) this.modalShowOnDesktop();
			else this.modalShowOnMobile();
			if (typeof callback === 'function')
			{
				callback();
			}
			setTimeout($.proxy(function()
			{
				this.callback('modalOpened', this.$redactorModal);

			}, this), 11);
			$(document).off('focusin.modal');
			this.$redactorModal.find('input[type=text]').on('keypress', $.proxy(function(e)
			{
				if (e.which === 13)
				{
					this.$redactorModal.find('.redactor_modal_action_btn').trigger('click');
					e.preventDefault();
				}
			}, this));

			return this.$redactorModal;

		},
		modalShowOnDesktop: function()
		{
			this.$redactorModal.css({
				position: 'fixed',
				top: '-2000px',
				left: '50%',
				width: this.$redactorModalWidth + 'px',
				marginLeft: '-' + (this.$redactorModalWidth / 2) + 'px'
			}).show();

			this.modalSaveBodyOveflow = $(document.body).css('overflow');
			$(document.body).css('overflow', 'hidden');

			setTimeout($.proxy(function()
			{
				var height = this.$redactorModal.outerHeight();
				this.$redactorModal.css({
					top: '50%',
					height: 'auto',
					minHeight: 'auto',
					marginTop: '-' + (height + 10) / 2 + 'px'
				});
			}, this), 15);
		},
		modalShowOnMobile: function()
		{
			this.$redactorModal.css({
				position: 'fixed',
				width: '100%',
				height: '100%',
				top: '0',
				left: '0',
				margin: '0',
				minHeight: '300px'
			}).show();
		},
		modalSetContent: function(content)
		{
			this.modalcontent = false;
			if (content.indexOf('#') == 0)
			{
				this.modalcontent = $(content);
				$('#redactor_modal_inner').empty().append(this.modalcontent.html());
				this.modalcontent.html('');

			}
			else
			{
				$('#redactor_modal_inner').empty().append(content);
			}
		},
		modalSetTitle: function(title)
		{
			this.$redactorModal.find('#redactor_modal_header').html(title);
		},
		modalSetButtonsWidth: function(){},
		modalOnCloseButton: function()
		{
			this.$redactorModal.find('.redactor_btn_modal_close').on('click', $.proxy(this.modalClose, this));
		},
		modalSetOverlay: function()
		{
			if (this.opts.modalOverlay)
			{
				this.$redactorModalOverlay = $('#redactor_modal_overlay');
				if (!this.$redactorModalOverlay.length)
				{
					this.$redactorModalOverlay = $('<div id="redactor_modal_overlay" style="display: none;"></div>');
					$('body').prepend(this.$redactorModalOverlay);
				}

				this.$redactorModalOverlay.show().on('click', $.proxy(this.modalClose, this));
			}
		},
		modalSetDraggable: function()
		{
			if (typeof $.fn.draggable !== 'undefined')
			{
				this.$redactorModal.draggable({ handle: '#redactor_modal_header' });
				this.$redactorModal.find('#redactor_modal_header').css('cursor', 'move');
			}
		},
		modalLoadTabs: function()
		{
			var $redactor_tabs = $('#redactor_tabs');
			if (!$redactor_tabs.length) return false;

			var that = this;
			$redactor_tabs.find('a').each(function(i, s)
			{
				i++;
				$(s).on('click', function(e)
				{
					e.preventDefault();

					$redactor_tabs.find('a').removeClass('redactor_tabs_act');
					$(this).addClass('redactor_tabs_act');
					$('.redactor_tab').hide();
					$('#redactor_tab' + i ).show();
					$('#redactor_tab_selected').val(i);

					if (that.isMobile() === false)
					{
						var height = that.$redactorModal.outerHeight();
						that.$redactorModal.css('margin-top', '-' + (height + 10) / 2 + 'px');
					}
				});
			});

		},
		modalCloseHandler: function(e)
		{
			if (e.keyCode === this.keyCode.ESC)
			{
				this.modalClose();
				return false;
			}
		},
		modalClose: function()
		{
			$('#redactor_modal_close').off('click', this.modalClose);
			$('#redactor_modal').fadeOut('fast', $.proxy(function()
			{
				var redactorModalInner = $('#redactor_modal_inner');

				if (this.modalcontent !== false)
				{
					this.modalcontent.html(redactorModalInner.html());
					this.modalcontent = false;
				}

				redactorModalInner.html('');

				if (this.opts.modalOverlay)
				{
					$('#redactor_modal_overlay').hide().off('click', this.modalClose);
				}

				$(document).off('keyup', this.modalCloseHandler);
				this.$editor.off('keyup', this.modalCloseHandler);

				this.selectionRestore();
				if (this.opts.autoresize && this.saveModalScroll)
				{
					$(this.document.body).scrollTop(this.saveModalScroll);
				}
				else if (this.opts.autoresize === false && this.saveModalScroll)
				{
					this.$editor.scrollTop(this.saveModalScroll);
				}

				this.callback('modalClosed');

			}, this));
			if (this.isMobile() === false)
			{
				$(document.body).css('overflow', this.modalSaveBodyOveflow ? this.modalSaveBodyOveflow : 'visible');
			}

			return false;
		},
		modalSetTab: function(num)
		{
			$('.redactor_tab').hide();
			$('#redactor_tabs').find('a').removeClass('redactor_tabs_act').eq(num - 1).addClass('redactor_tabs_act');
			$('#redactor_tab' + num).show();
		},
		s3handleFileSelect: function(e)
		{
			var files = e.target.files;

			for (var i = 0, f; f = files[i]; i++)
			{
				this.s3uploadFile(f);
			}
		},
		s3uploadFile: function(file)
		{
			this.s3executeOnSignedUrl(file, $.proxy(function(signedURL)
			{
				this.s3uploadToS3(file, signedURL);
			}, this));
		},
		s3executeOnSignedUrl: function(file, callback)
		{
			var xhr = new XMLHttpRequest();

			var mark = '?';
			if (this.opts.s3.search(/\?/) != '-1') mark = '&';

			xhr.open('GET', this.opts.s3 + mark + 'name=' + file.name + '&type=' + file.type, true);
			if (xhr.overrideMimeType) xhr.overrideMimeType('text/plain; charset=x-user-defined');

			var that = this;
			xhr.onreadystatechange = function(e)
			{
				if (this.readyState == 4 && this.status == 200)
				{
					that.showProgressBar();
					callback(decodeURIComponent(this.responseText));
				}
				else if(this.readyState == 4 && this.status != 200)
				{

				}
			};

			xhr.send();
		},
		s3createCORSRequest: function(method, url)
		{
			var xhr = new XMLHttpRequest();
			if ("withCredentials" in xhr)
			{
				xhr.open(method, url, true);
			}
			else if (typeof XDomainRequest != "undefined")
			{
				xhr = new XDomainRequest();
				xhr.open(method, url);
			}
			else
			{
				xhr = null;
			}

			return xhr;
		},
		s3uploadToS3: function(file, url)
		{
			var xhr = this.s3createCORSRequest('PUT', url);
			if (!xhr)
			{

			}
			else
			{
				xhr.onload = $.proxy(function()
				{
					if (xhr.status == 200)
					{
						this.hideProgressBar();

						var s3image = url.split('?');

						if (!s3image[0])
						{

							 return false;
						}

						this.selectionRestore();

						var html = '';
						html = '<img id="image-marker" src="' + s3image[0] + '" />';
						if (this.opts.paragraphy) html = '<p>' + html + '</p>';

						this.execCommand('inserthtml', html, false);

						var image = $(this.$editor.find('img#image-marker'));

						if (image.length) image.removeAttr('id');
						else image = false;

						this.sync();
						this.callback('imageUpload', image, false);

						this.modalClose();
						this.observeImages();

					}
					else
					{

					}
				}, this);

				xhr.onerror = function()
				{

				};

				xhr.upload.onprogress = function(e)
				{
					/*
					if (e.lengthComputable)
					{
						var percentLoaded = Math.round((e.loaded / e.total) * 100);
						setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
					}
					*/
				};

				xhr.setRequestHeader('Content-Type', file.type);
				xhr.setRequestHeader('x-amz-acl', 'public-read');

				xhr.send(file);
			}
		},
		uploadInit: function(el, options)
		{
			this.uploadOptions = {
				url: false,
				success: false,
				error: false,
				start: false,
				trigger: false,
				auto: false,
				input: false
			};

			$.extend(this.uploadOptions, options);

			var $el = $('#' + el);
			if ($el.length && $el[0].tagName === 'INPUT')
			{
				this.uploadOptions.input = $el;
				this.el = $($el[0].form);
			}
			else this.el = $el;

			this.element_action = this.el.attr('action');
			if (this.uploadOptions.auto)
			{
				$(this.uploadOptions.input).change($.proxy(function(e)
				{
					this.el.submit(function(e)
					{
						return false;
					});

					this.uploadSubmit(e);

				}, this));

			}
			else if (this.uploadOptions.trigger)
			{
				$('#' + this.uploadOptions.trigger).on('click', $.proxy(this.uploadSubmit, this));
			}
		},
		uploadSubmit: function(e)
		{
			this.showProgressBar();
			this.uploadForm(this.element, this.uploadFrame());
		},
		uploadFrame: function()
		{
			this.id = 'f' + Math.floor(Math.random() * 99999);

			var d = this.document.createElement('div');
			var iframe = '<iframe style="display:none" id="' + this.id + '" name="' + this.id + '"></iframe>';

			d.innerHTML = iframe;
			$(d).appendTo("body");
			if (this.uploadOptions.start) this.uploadOptions.start();

			$( '#' + this.id ).one('load', $.proxy(this.uploadLoaded, this));

			return this.id;
		},
		uploadForm: function(f, name)
		{
			if (this.uploadOptions.input)
			{
				var formId = 'redactorUploadForm' + this.id,
					fileId = 'redactorUploadFile' + this.id;

				this.form = $('<form  action="' + this.uploadOptions.url + '" method="POST" target="' + name + '" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data" />');
				if (this.opts.uploadFields !== false && typeof this.opts.uploadFields === 'object')
				{
					$.each(this.opts.uploadFields, $.proxy(function(k, v)
					{
						if (v != null && v.toString().indexOf('#') === 0) v = $(v).val();

						var hidden = $('<input/>', {
							'type': "hidden",
							'name': k,
							'value': v
						});

						$(this.form).append(hidden);

					}, this));
				}

				var oldElement = this.uploadOptions.input;
				var newElement = $(oldElement).clone();

				$(oldElement).attr('id', fileId).before(newElement).appendTo(this.form);

				$(this.form).css('position', 'absolute')
						.css('top', '-2000px')
						.css('left', '-2000px')
						.appendTo('body');

				this.form.submit();

			}
			else
			{
				f.attr('target', name)
					.attr('method', 'POST')
					.attr('enctype', 'multipart/form-data')
					.attr('action', this.uploadOptions.url);

				this.element.submit();
			}
		},
		uploadLoaded: function()
		{
			var i = $( '#' + this.id)[0], d;

			if (i.contentDocument) d = i.contentDocument;
			else if (i.contentWindow) d = i.contentWindow.document;
			else d = window.frames[this.id].document;
			if (this.uploadOptions.success)
			{
				this.hideProgressBar();

				if (typeof d !== 'undefined')
				{

					var rawString = d.body.innerHTML;
					var jsonString = rawString.match(/\{(.|\n)*\}/)[0];

					jsonString = jsonString.replace(/^\[/, '');
					jsonString = jsonString.replace(/\]$/, '');

					var json = $.parseJSON(jsonString);

					if (typeof json.error == 'undefined') { this.uploadOptions.success(json); }
					else
					{
                        console.log(json);
						this.uploadOptions.error(this, json);
						this.modalClose();
					}
				}
				else
				{
					this.modalClose();
					alert('Upload failed!');
				}
			}

			this.el.attr('action', this.element_action);
			this.el.attr('target', '');
		},
		draguploadInit: function (el, options)
		{
			this.draguploadOptions = $.extend({
				url: false,
				success: false,
				error: false,
				preview: false,
				uploadFields: false,
				text: this.opts.curLang.drop_file_here,
				atext: this.opts.curLang.or_choose,
				uploadParam: false
			}, options);

			if (window.FormData === undefined) return false;

			this.droparea = $('<div class="redactor_droparea"></div>');
			this.dropareabox = $('<div class="redactor_dropareabox">' + this.draguploadOptions.text + '</div>');
			this.dropalternative = $('<div class="redactor_dropalternative">' + this.draguploadOptions.atext + '</div>');

			this.droparea.append(this.dropareabox);

			$(el).before(this.droparea);
			$(el).before(this.dropalternative);
			this.dropareabox.on('dragover', $.proxy(function()
			{
				return this.draguploadOndrag();

			}, this));
			this.dropareabox.on('dragleave', $.proxy(function()
			{
				return this.draguploadOndragleave();

			}, this));
			this.dropareabox.get(0).ondrop = $.proxy(function(e)
			{
				e.preventDefault();

				this.dropareabox.removeClass('hover').addClass('drop');
				this.showProgressBar();
                                for(var nmb in e.dataTransfer.files){
                                    if(!e.dataTransfer.files.hasOwnProperty(nmb))continue;
                                    this.dragUploadAjax(this.draguploadOptions.url, e.dataTransfer.files[nmb], false, e, this.draguploadOptions.uploadParam);
                                }

			}, this );
		},
		dragUploadAjax: function(url, file, directupload, e, uploadParam)
		{
			if (!directupload)
			{
				var xhr = $.ajaxSettings.xhr();
				if (xhr.upload)
				{
					xhr.upload.addEventListener('progress', $.proxy(this.uploadProgress, this), false);
				}

				$.ajaxSetup({
				  xhr: function () { return xhr; }
				});
			}
			this.callback('drop', e);

			var fd = new FormData();
			if (uploadParam !== false)
			{
				fd.append(uploadParam, file);
			}
			else
			{
				fd.append('file', file);
			}
			if (this.opts.uploadFields !== false && typeof this.opts.uploadFields === 'object')
			{
				$.each(this.opts.uploadFields, $.proxy(function(k, v)
				{
					if (v != null && v.toString().indexOf('#') === 0) v = $(v).val();
					fd.append(k, v);

				}, this));
			}

			$.ajax({
				url: url,
				dataType: 'html',
                                async: false,
				data: fd,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				success: $.proxy(function(data)
				{
					data = data.replace(/^\[/, '');
					data = data.replace(/\]$/, '');

					var json = (typeof data === 'string' ? $.parseJSON(data) : data);

					this.hideProgressBar();

					if (directupload)
					{
					    var $img = $('<img>');
						$img.attr('src', json.image.url).attr('id', 'drag-image-marker');

						this.insertNodeToCaretPositionFromPoint(e, $img[0]);

						var image = $(this.$editor.find('img#drag-image-marker'));
						if (image.length) image.removeAttr('id');
						else image = false;

						this.sync();
						this.observeImages();
						if (image) this.callback('imageUpload', image, json);
						if (typeof json.error !== 'undefined') this.callback('imageUploadError', json);
					}
					else
					{
						if (typeof json.error == 'undefined')
						{
							this.draguploadOptions.success(json);
						}
						else
						{
							this.draguploadOptions.error(this, json);
							this.draguploadOptions.success(false);
						}
					}

				}, this)
			});
		},
		draguploadOndrag: function()
		{
			this.dropareabox.addClass('hover');
			return false;
		},
		draguploadOndragleave: function()
		{
			this.dropareabox.removeClass('hover');
			return false;
		},
		uploadProgress: function(e, text)
		{
			var percent = e.loaded ? parseInt(e.loaded / e.total * 100, 10) : e;
			this.dropareabox.text('Loading ' + percent + '% ' + (text || ''));
		},
		isMobile: function()
		{
			return /(iPhone|iPod|BlackBerry|Android)/.test(navigator.userAgent);
		},
		isIPad: function()
		{
			return /iPad/.test(navigator.userAgent);
		},
		normalize: function(str)
		{
			if (typeof(str) === 'undefined') return 0;
			return parseInt(str.replace('px',''), 10);
		},
		outerHtml: function(el)
		{
			return $('<div>').append($(el).eq(0).clone()).html();
		},
		stripHtml: function(html)
		{
			var tmp = document.createElement("DIV");
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || "";
		},
		isString: function(obj)
		{
			return Object.prototype.toString.call(obj) == '[object String]';
		},
		isEmpty: function(html)
		{
			html = html.replace(/&#x200b;|<br>|<br\/>|&nbsp;/gi, '');
			html = html.replace(/\s/g, '');
			html = html.replace(/^<p>[^\W\w\D\d]*?<\/p>$/i, '');

			return html == '';
		},
		getInternetExplorerVersion: function()
		{
			var rv = false;
			if (navigator.appName == 'Microsoft Internet Explorer')
			{
				var ua = navigator.userAgent;
				var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) != null)
				{
					rv = parseFloat(RegExp.$1);
				}
			}

			return rv;
		},
		isIe11: function()
		{
			return !!navigator.userAgent.match(/Trident\/7\./);
		},
		browser: function(browser)
		{
			var ua = navigator.userAgent.toLowerCase();
			var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
            /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
            /(webkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
            /(msie) ([\w.]+)/.exec( ua ) ||
            ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
            [];

			if (browser == 'version') return match[2];
			if (browser == 'webkit') return (match[1] == 'chrome' || match[1] == 'webkit');
			if (match[1] == 'rv') return browser == 'msie';
			if (match[1] == 'opr') return browser == 'webkit';

			return browser == match[1];

		},
		oldIE: function()
		{
			if (this.browser('msie') && parseInt(this.browser('version'), 10) < 9) return true;
			return false;
		},
		getFragmentHtml: function (fragment)
		{
			var cloned = fragment.cloneNode(true);
			var div = this.document.createElement('div');

			div.appendChild(cloned);
			return div.innerHTML;
		},
		extractContent: function()
		{
			var node = this.$editor[0];
			var frag = this.document.createDocumentFragment();
			var child;

			while ((child = node.firstChild))
			{
				frag.appendChild(child);
			}

			return frag;
		},
		isParentRedactor: function(el)
		{
			if (!el) return false;
			if (this.opts.iframe) return el;

			if ($(el).parents('div.redactor_editor').length == 0 || $(el).hasClass('redactor_editor')) return false;
			else return el;
		},
		currentOrParentIs: function(tagName)
		{
			var parent = this.getParent(), current = this.getCurrent();
			return parent && parent.tagName === tagName ? parent : current && current.tagName === tagName ? current : false;
		},
		isEndOfElement: function()
		{
			var current = this.getBlock();
			var offset = this.getCaretOffset(current);

			var text = $.trim($(current).text()).replace(/\n\r\n/g, '');

			var len = text.length;

			if (offset == len) return true;
			else return false;
		},
		isFocused: function()
		{
			var el, sel = this.getSelection();

			if (sel && sel.rangeCount && sel.rangeCount > 0) el = sel.getRangeAt(0).startContainer;
			if (!el) return false;
			if (this.opts.iframe)
			{
				if (this.getCaretOffsetRange().equals()) return !this.$editor.is(el);
				else return true;
			}

			return $(el).closest('div.redactor_editor').length != 0;
		},
		removeEmptyAttr: function (el, attr)
		{
			if ($(el).attr(attr) == '') $(el).removeAttr(attr);
		},
		removeFromArrayByValue: function(array, value)
		{
			var index = null;

			while ((index = array.indexOf(value)) !== -1)
			{
				array.splice(index, 1);
			}

			return array;
		}

	};
	Redactor.prototype.init.prototype = Redactor.prototype;
	$.Redactor.fn.formatLinkify = function(protocol, convertLinks, convertImageLinks, convertVideoLinks, linkSize)
	{
		var url = /(((https?|ftps?):\/\/)|www[.][^\s])(.+?\..+?)([.),]?)(\s|\.\s+|\)|$)/gi,
			rProtocol = /(https?|ftp):\/\//i,
			urlImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gi;

		var childNodes = (this.$editor ? this.$editor.get(0) : this).childNodes, i = childNodes.length;
		while (i--)
		{
			var n = childNodes[i];
			if (n.nodeType === 3)
			{
				var html = n.nodeValue;
				if (convertVideoLinks && html)
				{
					var iframeStart = '<iframe width="500" height="281" src="',
						iframeEnd = '" frameborder="0" allowfullscreen></iframe>';

					if (html.match(reUrlYoutube))
					{
						html = html.replace(reUrlYoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
						$(n).after(html).remove();
					}
					else if (html.match(reUrlVimeo))
					{
						html = html.replace(reUrlVimeo, iframeStart + '//player.vimeo.com/video/$2' + iframeEnd);
						$(n).after(html).remove();
					}
				}
				if (convertImageLinks && html && html.match(urlImage))
				{
					html = html.replace(urlImage, '<img src="$1">');

					$(n).after(html).remove();
				}
				if (convertLinks && html && html.match(url))
				{
					var matches = html.match(url);

					for (var i in matches)
					{
						var href = matches[i];
						var text = href;

						var space = '';
						if (href.match(/\s$/) !== null) space = ' ';

						var addProtocol = protocol;
						if (href.match(rProtocol) !== null) addProtocol = '';

						if (text.length > linkSize) text = text.substring(0, linkSize) + '...';

						text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

						/*
							To handle URLs which may have $ characters in them, need to escape $ -> $$ to prevent $1 from getting treated as a backreference.
							See http://gotofritz.net/blog/code-snippets/escaping-in-replace-strings-in-javascript/
						*/
						var escapedBackReferences = text.replace('$', '$$$');

						html = html.replace(href, '<a href=\"' + addProtocol + $.trim(href) + '\">' + $.trim(escapedBackReferences) + '</a>' + space);
					}

					$(n).after(html).remove();
				}
			}
			else if (n.nodeType === 1 && !/^(a|button|textarea)$/i.test(n.tagName))
			{
				$.Redactor.fn.formatLinkify.call(n, protocol, convertLinks, convertImageLinks, convertVideoLinks, linkSize);
			}
		}
	};

})(jQuery);