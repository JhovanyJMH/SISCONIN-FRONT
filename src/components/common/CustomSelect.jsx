import React from "react";
import clsx from "clsx";
import Select from "react-select";

export const CustomSelect = React.forwardRef((props, ref) => {
  const controlStyles = {
    base: "py-1 px-0 w-full text-lg text-gray-800 border-gray-500 bg-transparent border-0 border-b-2 hover:cursor-pointer",
    focus: "border-orange-900 appearance-none",
    nonFocus: "focus:outline-none focus:ring-0 focus:border-orange-400 peer",
  };
  const placeholderStyles = "text-gray-500 pl-1 py-0.5";
  const selectInputStyles = "pl-1 py-0.5";
  const valueContainerStyles = "p-1 gap-1";
  const singleValueStyles = "leading-7 ml-1";
  const multiValueStyles = "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
  const multiValueLabelStyles = "leading-6 py-0.5";
  const multiValueRemoveStyles = "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
  const indicatorsContainerStyles = "p-1 gap-1";
  const menuStyles = "p-1 mt-2 border border-2 border-gray-300 bg-white rounded-lg z-[9999] shadow-lg";
  const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
  const optionStyles = {
    base: "hover:cursor-pointer hover:text-slate-700 px-3 py-2 rounded",
    focus: "bg-orange-200 active:bg-rose-900 active:text-white",
    selected: "after:content-['✔'] after:ml-2 after:hover:active:text-white bg-rose-900 after:text-orange-300 text-gray-100",
  };
  const noOptionsMessageStyles = "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-sm";

  return (
    <Select
      isMulti={props.isMulti}
      closeMenuOnSelect={true}
      hideSelectedOptions={false}
      ref={ref}
      menuPosition="fixed"
      placeholder="Selecciona una opción"
      unstyled
      styles={{
        input: (base) => ({
          ...base,
          "input:focus": {
            boxShadow: "none",
          },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        multiValueLabel: (base) => ({
          ...base,
          whiteSpace: "normal",
          overflow: "visible",
        }),
        control: (base) => ({
          ...base,
          transition: "none",
        }),
      }}
      classNames={{
        control: ({ isFocused }) =>
          clsx(
            isFocused ? controlStyles.focus : controlStyles.nonFocus,
            controlStyles.base,
          ),
        placeholder: () => placeholderStyles,
        input: () => selectInputStyles,
        valueContainer: () => valueContainerStyles,
        singleValue: () => singleValueStyles,
        multiValue: () => multiValueStyles,
        multiValueLabel: () => multiValueLabelStyles,
        multiValueRemove: () => multiValueRemoveStyles,
        indicatorsContainer: () => indicatorsContainerStyles,
        menu: () => menuStyles,
        groupHeading: () => groupHeadingStyles,
        option: ({ isFocused, isSelected }) =>
          clsx(
            isFocused && optionStyles.focus,
            isSelected && optionStyles.selected,
            optionStyles.base,
          ),
        noOptionsMessage: () => noOptionsMessageStyles,
      }}
      {...props}
    />
  );
});

export default CustomSelect; 