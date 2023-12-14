import {Button, MenuItem} from "@blueprintjs/core";
import { Select2, ItemRenderer, ItemPredicate } from "@blueprintjs/select";
import {EditableCell2Props, EditableCell2, Cell} from "@blueprintjs/table";
import React, {useEffect, useMemo} from "react";

// @ts-ignore
import hyper from "@macrostrat/hyper";

import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/select/lib/css/blueprint-select.css";
import styles from "../../edit-table.module.sass";


const h = hyper.styled(styles);

interface Timescale {
	timescale_id: number
	name: string
}

export interface Interval {
	int_id: number
	name: string
	abbrev: string
	t_age: number
	b_age: number
	int_type: string
	timescales: Timescale[]
	color: string
}

const IntervalOption: ItemRenderer<Interval> = (interval: Interval, { handleClick, handleFocus, modifiers }) => {

	if (interval == null) {
		return h(MenuItem, {
			shouldDismissPopover: true,
			active: modifiers.active,
			disabled: modifiers.disabled,
			key: "",
			label: "",
			onClick: handleClick,
			onFocus: handleFocus,
			text: "",
			roleStructure:"listoption"
		}, [])
	}

	return h(MenuItem, {
		style: {backgroundColor: interval.color},
		shouldDismissPopover: true,
		active: modifiers.active,
		disabled: modifiers.disabled,
		key: interval.int_id,
		label: interval.int_id.toString(),
		onClick: handleClick,
		onFocus: handleFocus,
		text: interval.name,
		roleStructure:"listoption"
	}, [])
}


const IntervalSelection = ({value, onConfirm, intent, ...props} : EditableCell2Props) => {

	const [intervalValues, setIntervalValues] = React.useState<Interval[]>([]);
	const [localValue, setLocalValue] = React.useState<string>(value);

	const filterInterval: ItemPredicate<Interval> = (query, interval) => {

		if(interval?.name == undefined){
			return false
		}
		return interval.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
	}

	const interval = useMemo(() => {

		let interval = null
		if(intervalValues.length != 0){
			interval = intervalValues.filter((interval) => interval.int_id == parseInt(value))[0]
		}

		return interval
	}, [value, localValue, intervalValues])

	useEffect(() => {

		async function getIntervals() {
			let response = await fetch(`https://macrostrat.org/api/defs/intervals?tilescale_id=11`)

			if (response.ok) {
				let response_data = await response.json();
				setIntervalValues(response_data.success.data);
			}
		}

		getIntervals()
	}, [])

	return h(Cell, {
		...props,
		style: {...props.style, padding: 0},
	}, [
		h(Select2<Interval>, {
			fill: true,
			items: intervalValues,
			className: "update-input-group",
			popoverProps: {
				position: "bottom",
				minimal: true
			},
			popoverContentProps:{
				onWheelCapture: (event) => event.stopPropagation()
			},
			itemPredicate: filterInterval,
			itemRenderer: IntervalOption,
			onItemSelect: (interval: Interval, e) => {
				onConfirm(interval.int_id.toString())
				setLocalValue(interval.int_id.toString())
			},
			noResults: h(MenuItem, {disabled: true, text: "No results.", roleStructure: "listoption"}),
		}, [
			h(Button, {
				style: {backgroundColor: interval?.color ?? "white", fontSize: "12px", minHeight: "0px", padding: "1.7px 10px", boxShadow: "none"},
				fill: true,
				alignText: "left",
				text: h("span", {style: {overflow: "hidden", textOverflow: "ellipses"}}, interval?.name ?? "Select an Interval"),
				rightIcon: "double-caret-vertical",
				className: "update-input-group",
				placeholder: "Select A Filter"
			}, [])
		]),
	])
}


export default IntervalSelection;
