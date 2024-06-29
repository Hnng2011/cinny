import { style } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

export const Welcome = style({
  height: '100%',
  backgroundColor: color.Background.Container,
  color: color.Background.OnContainer,
  position: 'relative',
});

export const Background = style({
  width: toRem(700),
  height: toRem(700),
  borderRadius: '50%',
  position: 'absolute',
  zIndex: '10',
  left: toRem(-100),
  top: toRem(-100),
  animation: 'bluring 10s linear infinite alternate',
  opacity: '70%',
});

export const Container = style({
  minHeight: '100%',
  width: '100%',
  maxWidth: toRem(1440),
  backgroundColor: color.Background.Container,
  padding: `0 ${config.space.S400} 0 ${config.space.S400}`,
  marginInline: 'auto',
  position: 'relative',
});

export const Navigation = style({
  minHeight: toRem(80),
  maxHeight: toRem(100),
  height: '10%',
  width: '100%',
});

export const Content = style({
  height: '100%',
  width: '100%',
  color: color.Background.OnContainer,
  zIndex: '11',
});

export const ContentMain = style({
  margin: `${config.space.S700} 0 ${toRem(100)} 0`,
});

export const Logo = style([
  DefaultReset,
  {
    width: toRem(26),
    height: toRem(26),
    borderRadius: '50%',
  },
]);

export const SubHeader = style({
  fontWeight: config.fontWeight.W700,
  color: color.Secondary.Main,
});

export const MainHeader = style({
  fontSize: toRem(80),
  fontWeight: config.fontWeight.W900,
});

export const FlexItem = style({
  flexBasis: '25%',
  padding: config.space.S400,
  borderWidth: config.borderWidth.B300,
  boxShadow: config.shadow.E400,
  borderRadius: toRem(5),
  backgroundColor: color.SurfaceVariant.Container,
});
