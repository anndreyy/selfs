(function($){
	$.fn.extend({  		
		//pass the options variable to the function
		selfs: function(options) {
			var that = $(this);
			var defaults = {
					text: $(this).text(),
				};

			var options =  $.extend(defaults, options);
			var css = {};		

				//Import css
				var cssId = 'myCss';  // you could encode the css path itself to generate id..
				if(!document.getElementById(cssId))
				{
					var head  = document.getElementsByTagName('head')[0];
					var link  = document.createElement('link');
					link.id   = cssId;
					link.rel  = 'stylesheet';
					link.type = 'text/css';
					link.href = 'selfs.css';
					link.media = 'all';
					head.appendChild(link);
				}


			function init(){
				that.each(function(){

					//Element
					let element = $(this);

					//Encapsula o elemento
					let self_select = element.wrap("<div class = 'self_select'></div>");

					let old_value = "";

					//Oculta o select 
					element.hide();

					//Pega o elemento pai do select que é a div aonde a gente vai trabalhar
					self_select = self_select.parent();

					//Adiciona input para pesquisa
					let search = $("<input class = 'search' placeholder = 'Procurar' data-value>").appendTo(self_select);

					//Adiciona o css 
					// search.css(css.search);

					//Adiciona input para pesquisa
					let box_result = $("<div class = 'box_result'></div>").appendTo(self_select);

					//transforma as opções em um objeto 
					//Caso não tenha value
					let items = [];
					element.find("option").each(function(){
						let obj = {};
						obj.text = $.trim(this.text);
						obj.value = $.trim(this.value);
						obj.text_formated = 
							$.trim(this.text)
							.toLowerCase()
							.normalize('NFD')
							.replace(/([\u0300-\u036f]| |-)/g, "");

						items.push(obj);
					});
					// console.table(items);					

					//No caso de value ele cria um objeto diferente
					//todo:

					//Evento para pesquisa
					search.keyup(function(event){
						let value = $(this).val();

						//Verifica se pesquisa mudou
						if(value != old_value){
							search_obj(value, items, box_result);
							old_value = value;
						}

						// console.log(event.keyCode);

						switch(event.keyCode){
							//Verifica se foi apertado para baixo
							case 40:
								//Verifica se já foi selecionado um item
								if(box_result.find(".item.selected").length == 0){
									box_result.find(".item:eq(0)").addClass("selected");
								}else{
									var next = box_result.find(".item.selected").next();
									box_result.find(".item.selected").removeClass("selected");

									//Verifica se o proxima existe, se não existe é porque o ultimo era o ultimo item
									//Então ele pula para começo
									if(next.length !== 0){
										next.addClass("selected");
									}else{
										box_result.find(".item:eq(0)").addClass("selected");
									}

								}
								break;
							//Verifica se foi apertado para cima
							case 38: // up
								//Verifica se já foi selecionado um item
								if(box_result.find(".item.selected").length == 0){
									box_result.find(".item:eq(0)").addClass("selected");
								}else{
									var prev = box_result.find(".item.selected").prev();
									box_result.find(".item.selected").removeClass("selected");

									//verifica se o anterior existe, caso não exista é porque o ulimo seleciona erao primeiro item
									//Então pula para o final
									if(prev.length !== 0){
										prev.addClass("selected");
									}else{
										box_result.find(".item:last").addClass("selected");
									}
								}
								break;
							//Verifica se foi apertado o enter
							case 13:
								select_item(box_result);
								//Pausa
								break;
						}

					})
		
				});
			}

			//br: Função para pesquisar dentro de um objeto
			function search_obj(subject, objects, result) {

				//Formata o valor de pesquisado
				subject = subject
					.toLowerCase()
					.normalize('NFD')
					.replace(/([\u0300-\u036f]| |-)/g, "");
				let matches = [],
					regexp = new RegExp(subject, 'g');				


				for (let i = 0; i < objects.length; i++) {
					
					//Deixa em lower case
					let value = objects[i]["text_formated"];

					//Pesquisa dentro do obj
					if (value.match(regexp)){
						matches.push(objects[i]);	
					} 				

					//search in all key
					// for (key in objects[i]) {
					// 	console.log(key);
					// 	var value = objects[i][key].toLowerCase();
					// 	if (value.match(regexp)) matches.push(objects[i][key]);
					// }

				}

				//br:Adiciona ao reuslto
				box_result(matches, result);


				return matches;
			};

			//br: função para adicionar itens ao box_result
			function box_result(obj, result){
				//html
				let html = "";

				for (let i = 0; i <= obj.length - 1; i++) {					
					html += `<div class = 'item' data-value = '${obj[i].value}'>${obj[i].text}</div>`;
				}

				if(obj.length === 0){
					html = `<div class = 'no_result'>Sem resultado</div>`;
				}

				result
					.html(html)
					.show()
					.find(".item")
					.click(function(){
						$(this).addClass("selected");
						select_item(result);
					})
					;
			}

			//Função para selecionar um item
			function select_item(box_result){

				//Define as variavens
				var item = box_result.find(".item.selected");				
				var search = box_result.parent().find(".search");

				
				//Oculta o reusltado da pesquisa
				box_result.hide();


				search
					.val(item.text())
					.addClass("selected")
					.attr("data-value", item.attr("data-value"))
					//Evento para remover a classe no click
					.one("click focus", function(){ 
						$(this).removeClass("selected");
					})
					.blur()
					.focus(function(){
						box_result.show();
					})
				;
			}


			init(); //kick off the goodness
		}
	});
	
})(jQuery);