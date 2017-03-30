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
					let element = $(this),
					self_select,
					search,
					box_result;

					//Verifica se a função já não foi executado
					if(!element.parent().hasClass("self_select")){
						//Encapsula o elemento
						self_select = element.wrap("<div class = 'self_select'></div>");
						//Pega o elemento pai do select que é a div aonde a gente vai trabalhar
						self_select = self_select.parent();

						//Adiciona input para pesquisa
						search = $("<input class = 'search' placeholder = 'Procurar' data-value>").appendTo(self_select);

						box_result = $("<div class = 'box_result'></div>").appendTo(self_select);
					}else{

						self_select = element.parent();

						search = self_select.find(".search");
						//Adiciona input para pesquisa
						box_result = self_select.find(".box_result");
					}

					let old_value = "";

					//Oculta o select 
					element.hide();

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

					//Evento click para evitar que box seja fechado
					search.click(function(event){
						event.stopPropagation();
						event.preventDefault();
					})

					//Evento para pesquisa
					search
					.unbind("keydown")
					.on("keydown", function(event){
						let value = $(this).val();

						//Verifica se pesquisa mudou
						if(value != old_value){
							search_obj(value, items, box_result);
							old_value = value;
						}

						//Debug
						// console.log(event.keyCode);

						switch(event.keyCode){
							//Verifica se foi apertado para baixo
							case 40:
								//Verifica se já foi selecionado um item
								if(box_result.find(".item.selected").length == 0){									
									box_result.find(".item:eq(0)").addClass("selected");
								}else{
									var next = box_result.find(".item.selected").next();									
									//verifica se o proxima é o divier
									next = next.hasClass("divider") === true ? next.next() : next;

									box_result.find(".item.selected").removeClass("selected");

									//Verifica se o proxima existe, se não existe é porque o ultimo era o ultimo item
									//Então ele pula para começo
									if(next.length !== 0){									
										next
										.addClass("selected");

										//focus
										focus_select(next, search);
									}else{
										box_result
										.find(".item:eq(0)")
										.addClass("selected")
										
										//focus
										focus_select(box_result.find(".item:eq(0)"), search);
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
									//verifica se o proxima é o divier
									prev = prev.hasClass("divider") === true ? prev.prev() : prev;

									box_result.find(".item.selected").removeClass("selected");

									//verifica se o anterior existe, caso não exista é porque o ulimo seleciona erao primeiro item
									//Então pula para o final
									if(prev.length !== 0){
										prev.addClass("selected");

										//focus
										focus_select(prev, search);

									}else{
										box_result.find(".item:last").addClass("selected");

										//focus
										focus_select(box_result.find(".item:last"), search);
									}
								}
								break;
							//Verifica se foi apertado o enter
							case 13:
								select_item(box_result);
								//Pausa
								break;
							//Verifica se foi apertado o backspace
							case 8:
								search.attr("data-value", "");
								break;

						}
					})

					//Evento para focus na div
					.one("focus", function(){
						search_obj("", items, box_result);
					})


					//Eveneto para capturar o delete
					search.unbind("keyup").keyup(function(event){
						if(event.keyCode === 46){
							search_obj($(this).val(), items, box_result);
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
			function box_result(items, result){

				//Nome do select
				var select_name = result.parent().find("select").attr("name");

				//Verififca se existe no local storage alguma preferência para esse select
				if(localStorage.getItem("selfs_" + select_name)){
					var pref = localStorage.getItem("selfs_" + select_name);
					pref = JSON.parse(pref);
				}else{
					var pref = [];
				}				
					
				//html
				let	html = "";

				//Variaveis que guardaram os novos valores para preferencia e items
				let n_pref = [],
					n_items = [];

				//Loop  para preferencias
				for (let i = 0; i <= pref.length - 1; i++) {
					let exist = false;

					// Loop  para os itens
					for (let j = 0; j <= items.length - 1; j++) {		
						
						if(
							pref[i].text == items[j].text
								&& 
							pref[i].value == items[j].value
						){

							exist = true;
						}
					}

					if(exist === true){
						n_pref.push(pref[i]);
					}
				}


				//Loop  para itens
				for (let i = 0; i <= items.length - 1; i++) {
					let exist = false;

					// Loop  para os preferencias
					for (let j = 0; j <= pref.length - 1; j++) {
						if(
							items[i].text == pref[j].text
								&& 
							items[i].value == pref[j].value
						){

							exist = true;
						}
					}

					if(exist === false){
						n_items.push(items[i]);
					}
				}

				console.log("n_items.length", n_items.length);
				console.log("items.length", items.length);

				// return false;

				//Loop em torno de todos as prefencias
				for (let i = 0; i <= n_pref.length - 1; i++) {
		
					html += `
						<div class = 'item' data-value = '${n_pref[i].value}' data-text='${n_pref[i].text}'>
							<span class ='glyphicon glyphicon-star active'></span>
							${n_pref[i].text}
						</div>
					`;				
					
				}

				// return false;



				//Loop com os preferidos
				// preference:
					// for (let i = 0; i <= pref.length - 1; i++) {
					// 	console.log("Inreração:", i);
					// 	//define se o loop com os preferidos continua
					// 	let con = false;

					// 	//Remove do array os itens que já foram adicionados ao resultado como preferios
					// 	// items:
					// 		// for (let j = 0; j <= items.length - 1; j++) {
					// 		// 	if(items[j].text == pref[i].text && items[j].value == pref[i].value){							
					// 		// 		items.splice(j, 1);

					// 		// 		con = true;

					// 		// 		//para o loop
					// 		// 		// break items;
					// 		// 	}
					// 		// }

					// 	if(con === false){
					// 		console.log(1, i, "calculo");
					// 		console.log(pref, "pref");
					// 		console.log(n_pref, "n_pref");
					// 		// Remove o item od array para caso não haja nenhum preferido não exibir o separador
					// 		n_pref.splice(i, 1);
					// 		console.log(pref, "pref");

					// 		console.log(n_pref, "pos_removido");
					// 		// continue;
					// 	}else{

					// 		html += `
					// 			<div class = 'item' data-value = '${pref[i].value}' data-text='${pref[i].text}'>
					// 				<span class ='glyphicon glyphicon-star active'></span>
					// 				${pref[i].text}
					// 			</div>
					// 		`;
					// 	}

					// }	

				//Separador é exibido de acordo com os itens exisbidos de preferencia
				//Se nãoe xiste nenhuma não exibe a preferêcia
				if(n_pref.length > 0 && n_items.length > 0){
					html += "<div class = 'divider'></div>";
				}

				//Loop com os restantes
				for (let i = 0; i <= n_items.length - 1; i++) {

					html += `
						<div class = 'item' data-value = '${n_items[i].value}' data-text='${n_items[i].text}'>
							<span class ='glyphicon glyphicon-star'></span>
							${n_items[i].text}
						</div>
					`;
				}

				// console.log(n_items.length, n_pref.length);
				// console.log(n_items, n_pref);

				//Verifica se não hoube retorno da pesquisa
				if(n_items.length === 0 & n_pref.length === 0){
					html = `<div class = 'no_result'>Sem resultado</div>`;
				}

				result
					.html(html)
					.show()
					.find(".item")					
					.click(function(){
						$(this).addClass("selected");
						select_item(result);
					});

				//Adiciona um evento para fechar o rsultado no caso do click fora
				$(document).unbind("click").one("click", function(){
					result.hide();
				})				

				// Adiciona o evento para fixar um seletec
				result.find(".item > .glyphicon").click(function(e){
					e.stopPropagation();
					e.preventDefault();

					let elem = $(this).parent();
					let all_elem = elem.parent();
					let text = elem.data("text");
					let value = elem.data("value");
					let fav = [];
					
					//Verifica se á não está ativo
					if($(this).hasClass("active")){
						$(this).removeClass("active");		
					}else{
						$(this).addClass("active");						
					}

					all_elem.find(".glyphicon.active").each(function(){						
						let elem_p = $(this).parent();
						let obj = {
							text:elem_p.data("text"),
							value:elem_p.data("value")
						}
						fav.push(obj);						
					});

					// console.log(fav);
					
					localStorage.setItem("selfs_" + select_name, JSON.stringify(fav));

				});
			}

			//Função para selecionar um item
			function select_item(box_result){

				//Define as variavens
				var item = box_result.find(".item.selected");				
				var search = box_result.parent().find(".search");

				//Oculta o reusltado da pesquisa


				//Se nenhum item estiver selecionado e
				if(item.length == 0 && search.attr("data-value") == "")
					return false;

				//oculta o reusltado
				box_result.hide();

				
				if(item.length != 0){
					search
					.val(item.attr("data-text"))
					.attr("data-value", item.attr("data-value"))
				}
					
				search
					.addClass("selected")
					.unbind("click focus")
					//Evento para remover a classe no click
					.one("click focus", function(){ 
						$(this).removeClass("selected");
						box_result.find(".selected").removeClass("selected");
						box_result.show();
					})
					//Remove o focus do campos
					.blur();

				//Remove o select
				box_result.removeClass("selected");
			}

			//br: Função para focar no campo enquanto a barra de rolagem anda
			function focus_select(elem, search){
				elem.append("<input class = 'focus'>")
				.find(".focus")
				.focus()
				.remove();
				search.focus();
			}


			init(); //kick off the goodness
		}
	});
	
})(jQuery);