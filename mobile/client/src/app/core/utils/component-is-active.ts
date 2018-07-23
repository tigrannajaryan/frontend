type Predicate = (...args: any[]) => boolean;

export function componentIsActive(component): Predicate {
  component.__isActive = true;

  const ionViewWillLeave = component.ionViewWillLeave;

  component.ionViewWillLeave = () => {
    component.__isActive = false;
    return ionViewWillLeave && ionViewWillLeave.apply(component);
  };

  return () => component.__isActive;
}
