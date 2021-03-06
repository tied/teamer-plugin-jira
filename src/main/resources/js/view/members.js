define('view/members',
    ['jquery',
        'backbone',
        'underscore',
        'js/mustache',
        'view/project-result',
        'mainapp'
    ], function($, Backbone,_,mustache,ProjectResultView,App) {

    return Backbone.View.extend({
        events: {
            'click .billedToggleButton' : 'billedClick',
            'change .billedToggleButton' : 'billedClick'
        },
        projectData: null,
        membersCollection: null,

        initialize: function(options) {
            this.projectData = options.projectData;
            this.okp = parseInt($("#okpCost"+options.projectData.viewId).val())
            this.setElement(options.el)
            this.restfulTableId = options.restfulTableId
            this.addRESTfulTable();
        },
        billedClick: function (event) {
            if($(event.target).attr('checked') === 'checked') {
                $(event.target).val('on')
            } else {
                $(event.target).val('off')
            }
        },

        addRESTfulTable: function () {
            var that = this;
            var projectId = this.restfulTableId;
            var EditGroupView = AJS.RestfulTable.CustomCreateView.extend({

                render: function (self) {
                    var $text = $("<input type='text' value='"+ self.value +"' class='userSearcher text' name='user_id' placeholder='wyszukaj Usera'> ");
                    $text.val(self.value); //
                    return $text;
                }
            });

            var BilledAuiToogleReadView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {

                    var status = 'disabled';
                    if(self.value == "on"){
                        status = "checked disabled";
                    }
                    var $text = $(
                        '<input type="checkbox" name="billed" class="billedToggleButton" label="toggle button"' + status + '/>');

                    return $text;
                }
            });

            var BilledAuiToogleView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {

                    var isChecked = '';
                    if(self.value == "on"){
                        isChecked = "checked='checked'";
                    }else {
                        isChecked = "value='off'"
                    }
                    var $text = $(
                        '<input type="checkbox" name="billed" class="billedToggleButton" label="toggle button"' + isChecked + '/>');

                    return $text;
                }
            });

            var CostView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {
                    var value = typeof self.value === 'undefined' ? "" : self.value;
                    var $field = $('<input pattern="\\d*" type="text" class="text cost-input" value="' + value +'" name="cost">')
                    return $field;
                }
            });


            var AvailabilityView = AJS.RestfulTable.CustomEditView.extend({

                render: function (self) {
                    that.checkAvailability(projectId,self.value);
                    var value = typeof self.value === 'undefined' ? 100 : self.value;
                    var $field = $('<input pattern="\\d*" type="text" class="text availability-input" value="' + value +'" name="availability">')
                    return $field;
                }
            });

            var OKPView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {
                    var value = typeof self.value === 'undefined' ? "-" : self.value;
                    var $disabledField = $('<input type="text" class="text okp-input" value="' + value +'" name="okp" disabled>')
                    return $disabledField;
                }
            });

            var CostReadView = AJS.RestfulTable.CustomReadView.extend({
                render: function (self) {
                    var availability = this.model.get('availability')
                    var cost = this.model.get('cost')
                    var real_cost = parseInt((availability / 100) * cost);
                    this.model.set('okp',real_cost );
                    var $disabledField = $('<span class="cost-input">'+ real_cost+' zł</span>')
                    return $disabledField;
                }
            });

            var OKPReadView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {
                    //compute new okp and set to read view
                    var defineOkp = this.model.get('define_okp')
                    var availability = this.model.get('availability')
                    var real_okp = parseInt((availability / 100) * defineOkp);
                    this.model.set('okp',real_okp );
                    var $disabledField = $('<span class="okp-input">'+ real_okp+' zł</span>')
                    return $disabledField;
                }
            });

            var RoleAuiSelectView = AJS.RestfulTable.CustomEditView.extend({
                render: function (self) {
                    if(typeof self.value === 'undefined') {
                        self.value = "";
                    }
                    var select = '<aui-select src="/jira/rest/users/1.0/users/roles" can-create-values="true" ' +
                        ' placeholder="Wybierz rolę" name="role" >' +
                        '<aui-option selected="selected" value="'+ self.value + '"> ' + self.value + ' </aui-option>' +
                        '</aui-select>';

                    return $(select);
                }
            });

            var membersTable = new AJS.RestfulTable({
                autoFocus: true,
                el: this.$el,
                id: "restfultable_"+projectId,
                allowReorder: false,
                model:App.Models.MemberModel,

                //nie dostal user_id i dlatego nie ma null w projekie
                noEntriesMsg: "Brak osób powiązanych z projektem",
                resources: {
                    all: AJS.contextPath() + '/rest/projectmembers/1.0/projectmembers/'+projectId,
                    self: AJS.contextPath() + '/rest/projectmembers/1.0/projectmembers/'+projectId
                },
                columns: [
                    {
                        id: "project_member_id",
                        header: "id project member",
                        fieldName:"id",
                        allowEdit: false
                    },
                    {
                        id: "user_id",
                        header: "user id",
                        allowEdit: false
                    },
                    {
                        id: "developer_name",
                        fieldName:"developer_name",
                        header: "Imię i nazwisko",
                        allowEdit: false,
                        createView: EditGroupView
                    },
                    {
                        id: "role",
                        header: "Rola",
                        createView: RoleAuiSelectView,
                        editView: RoleAuiSelectView,
                    },
                    {
                        id: "billed",
                        fieldName: "biled",
                        header: "Bilowanie",
                        createView: BilledAuiToogleView,
                        editView: BilledAuiToogleView,
                        readView: BilledAuiToogleReadView
                    },
                    {
                        id: "availability",
                        header: "Zaangażowanie",
                        fieldName: "availability",
                        createView: AvailabilityView,
                        editView: AvailabilityView
                    },
                    {
                        id: "cost",
                        header: "Stawka",
                        fieldName: "cost",
                        readView: CostReadView,
                        createView: CostView,
                        editView: CostView
                    },
                    {
                        id: "okp",
                        header: "OKP",
                        readView: OKPReadView,
                        createView: OKPView,
                        editView: OKPView,
                    }
                ]
            });

            this.membersCollection = membersTable.getModels();
            this.listenTo(this.membersCollection, 'change', this.modifyUser);
            var $ecl =  this.$el

            this.membersCollection.fetch({
                async: false,
                success: function (data) {
                    var projectresultView = new ProjectResultView({collection:data,projectData:that.projectData});
                    if($ecl.next().length > 0) {
                        $ecl.after(projectresultView.render().el)
                    }
                    App.Collections.MemberCollection.items.push({
                        teamId:that.projectData.teamId,
                        projectId: that.projectData.projectId,
                        data:data
                    })
                }
            })

            $ecl.bind(AJS.RestfulTable.Events.INITIALIZED, function () {

                jQuery(document).bind(AJS.RestfulTable.Events.ROW_INITIALIZED, function (row) {
                    console.log('88')
                    row.bind(AJS.RestfulTable.Events.RENDER, function () {
                        alert('render!');

                        this.$el.addClass("myclass");
                    });

                    row.bind(AJS.RestfulTable.Events.UPDATED, function () {
                        alert('updated!!');

                        this.$el.addClass("myclass");
                    });
                });

                var elements = $ecl.find('.userSearcher');
                _.each(elements,function (element,i) {
                   var developerSelect = $(element).auiSelect2( {
                        ajax: {
                            url: AJS.contextPath() + '/rest/projectmembers/1.0/projectmembers/users',
                            dataType: 'json',
                            results: function results(data) {
                                usersDeveloperData = data;
                                return {
                                    results: data
                                };
                            },
                            data: function (params) {
                                console.log(params);
                                var query = {
                                    search: params,
                                }
                                // Query parameters will be ?search=[term]&type=public
                                return query;
                            }
                        }});
                    developerSelect.on('change',function (e) {
                        var developerAdded = e.added;
                        $(e.target).parent().next().find("aui-select[name=role]").val(developerAdded.role)
                        $(e.target).parent().parent().find("input[name=cost]").val(developerAdded.salary)
                    });
                })

            });

            var createRow = membersTable.getCreateRow();
            createRow.bind(AJS.RestfulTable.Events.VALIDATION_ERROR, function (errors) {
                alert('error!!!');
            });
            createRow.bind(AJS.RestfulTable.Events.SAVE, function (errors) {

            console.log(errors)
            });
            createRow.bind(AJS.RestfulTable.Events.CANCEL, function (errors) {
                alert('error!!!');
            });



            jQuery(document).bind(AJS.RestfulTable.Events.ROW_INITIALIZED, function (row) {
                console.log('88')
                row.bind(AJS.RestfulTable.Events.RENDER, function () {
                    alert('render!');

                    this.$el.addClass("myclass");
                });

                row.bind(AJS.RestfulTable.Events.UPDATED, function () {
                    alert('updated!!');

                    this.$el.addClass("myclass");
                });
                row.bind(AJS.RestfulTable.Events.SERVER_ERROR, function () {
                    alert('error!!');
                });
                row.bind(AJS.RestfulTable.Events.VALIDATION_ERROR, function () {
                    alert('error!!');
                });
            });

            jQuery(document).bind(AJS.RestfulTable.Events.ROW_ADDED, function (event,addedRow,table) {
                that.checkAvailability(addedRow)

                //hide 2 columns of "blank" row after added element!
                that.hideRow(table.$create[0],1)

                timeout = null;
                check = function () {
                    var rootElement= table.focusedRow.$el[0]
                    var element = rootElement.getElementsByClassName('userSearcher')[0];
                    if ($(element).is('[type=text]')) { // assuming a jQuery object here
                        that.hideRow(addedRow);
                        that.updateUserAttributes(addedRow);
                        that.checkIfUserNotExceedLimit(addedRow);
                        that.afterAddedRowCallback(addedRow,table,element);
                        clearTimeout(timeout)
                    } else {
                        timeout = setTimeout(check, 100);
                    }
                };
                check();
            });

            //triggered when a row edit is started by the user
            jQuery(document).bind(AJS.RestfulTable.Events.EDIT_ROW, function (event,editedRow,table) {
                editedRow.bind(AJS.RestfulTable.Events.CANCEL, function () {
                    that.hideRow(editedRow)
                });
                editedRow.bind(AJS.RestfulTable.Events.UPDATED, function () {
                    that.checkAvailability(editedRow)

                    that.hideRow(editedRow)
                });
                 that.hideRow(editedRow);
            });
            },

        checkAvailability: function (editedRow) {
            console.log(App.Collections.MemberCollection.items)
            console.log(editedRow)
            var members = [];
            if(App.Collections.MemberCollection.items.length > 0) {
                App.Collections.MemberCollection.items.map(function (memberData) {
                    console.log(memberData)
                    //1 iterate
                    memberData.data.models.map(function (member) {

                        members.push({memberId: member.get('user_id'),availability: member.get('availability')})
                    })
                })
            }

            console.log(members)
           /* members.map(function (member) {
                var availabilityTotal = member.availability;
                members.map(function (member2) {
                    if(member.memberId === member2.memberId){
                        availabilityTotal += member2.availability;
                    }
                    if(availabilityTotal > 100) {
                        console.log('jest wieksze od 100!!')
                    }
                })
            })*/
        },
        modifyUser: function (xx) {
            var that = this;
            var $ecl = this.$el;
            this.membersCollection.fetch({
                async: false,
                success: function (data) {
                    var projectresultView = new ProjectResultView({collection:data,projectData:that.projectData});
                    if($ecl.next().length > 0) {
                        $ecl.next().html(projectresultView.render().el)
                    } else {
                        $ecl.after().html(projectresultView.render().el)
                    }
                }
            })
        },

        hideRow: function(editedRow, isNotElement) {
            setTimeout(function () {
                if(typeof isNotElement === "undefined") {
                    var editedRowChildren = editedRow.el.children;
                } else {
                    var editedRowChildren = editedRow.children[0].children
                }

                editedRowChildren[0].style.display = "none";
                editedRowChildren[1].style.display = "none";
                $(editedRow.el).find("input.aui-button").on('click', function (e) {
                    var updatedRow = $(e.target).closest('tr');
                    setTimeout(function () {
                        var updatedRowColumns = $(updatedRow)[0].children;
                        updatedRowColumns[0].style.display = "none";
                        updatedRowColumns[1].style.display = "none";
                    },60)
                });
            }, 60);
        },

        checkIfUserNotExceedLimit: function (addedRow) {
             _.findWhere(usersDeveloperData,{id:Number(addedRow.model.get('user_id'))});

        },
        checkIfColumnsAreDisplayed: function (projectId,teamId) {
            var that = this;
            var membersTable = $("#person-list-"+teamId + "_"+projectId);
            var timeoutColumns = null;
            if(membersTable.length > 0 &&  $(membersTable.children()[2]).children().length > 0){
                this.hideColumns($(membersTable));
                clearTimeout(timeoutColumns)

            } else {
                timeoutColumns = setTimeout(function(){
                    that.checkIfColumnsAreDisplayed(projectId,teamId)
                }, 100);
            }
        },
        hideColumns:function (membersTable) {
            var $auiThead = membersTable.children()[0],
                $auiCreateRow = membersTable.children()[1],
                $auiBody = membersTable.children()[2],
                thColumns = $auiThead.children[0].children,
                tbody =$auiBody.children,
                tcreaterow =$auiCreateRow.children[0].children;

            for (var j = tbody.length - 1; j >= 0; j--) {
                var tcells = tbody[j].children;
                for (var k = tcells.length - 1;k>= 0; k--) {
                    if(k === 0|| k === 1) {
                        tcells[k].parentNode.removeChild(tcells[k]);
                    }
                }
            }

            for (var i = thColumns.length - 1; i >= 0; i--) {
                if(i === 0|| i === 1) {
                    thColumns[i].parentNode.removeChild(thColumns[i]);
                }
            }

            for (var i = tcreaterow.length - 1; i >= 0; i--) {
                if(i === 1|| i === 0) {
                    tcreaterow[i].parentNode.removeChild(tcreaterow[i]);
                }
            }
        },

        updateUserAttributes:function (addedRow) {
            var searchedDeveloper = _.findWhere(usersDeveloperData,{id:Number(addedRow.model.get('user_id'))});
            addedRow.model.set('developer_name',searchedDeveloper.text);

           // addedRow.model.set('cost',searchedDeveloper.salary);
            console.log(addedRow)
            addedRow.$el.find("input[name=cost]").val(searchedDeveloper.salary)

            addedRow.refresh()
        },

        afterAddedRowCallback: function (addedRow,table,element) {
           var developerSelect= $(element).auiSelect2( {
                ajax: {
                    url: AJS.contextPath() + '/rest/projectmembers/1.0/projectmembers/users',
                    dataType: 'json',
                    results: function results(data) {
                        usersDeveloperData = data;
                        return {
                            results: data
                        };
                    },
                    data: function (params) {
                        var query = {
                            search: params,
                        }
                        // Query parameters will be ?search=[term]&type=public
                        return query;
                    }
                }});

            developerSelect.on('change',function (e) {
               var developerAdded = e.added;
               $(e.target).parent().next().find("aui-select[name=role]").val(developerAdded.role)
               $(e.target).parent().parent().find("input[name=cost]").val(developerAdded.salary)
            });
        }
    });
});

usersDeveloperData = null;