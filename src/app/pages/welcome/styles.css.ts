import { style } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

export const Welcome = style({
  height: 'fit-content',
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
  '@media': {
    'screen and (max-width: 1200px)': {
      width: toRem(400),
      height: toRem(400),
      left: toRem(-60),
      top: toRem(-60),
    },
    'screen and (max-width: 960px)': {
      width: toRem(300),
      height: toRem(300),
      left: toRem(-40),
      top: toRem(-40),
    },
    'screen and (max-width: 768px)': {
      width: toRem(200),
      height: toRem(200),
      left: toRem(10),
      top: toRem(10),
    },
  },
});

export const Container = style({
  height: '100%',
  width: '100%',
  maxWidth: toRem(1440),
  backgroundColor: color.Background.Container,
  padding: config.space.S600,
  marginInline: 'auto',
  position: 'relative',
});

export const Navigation = style({
  minHeight: toRem(60),
  maxHeight: toRem(80),
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
  margin: `${config.space.S700} 0 ${config.space.S700} 0`,
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
  '@media': {
    'screen and (max-width: 1200px)': {
      fontSize: toRem(30),
    },
    'screen and (max-width: 768px)': {
      fontSize: toRem(20),
    },
  },
});

export const SubHeader2 = style({
  color: color.Critical.MainLine,
  '@media': {
    'screen and (max-width: 1200px)': {
      fontSize: toRem(30),
    },
    'screen and (max-width: 768px)': {
      fontSize: toRem(20),
    },
  },
});

export const MainHeader2 = style({
  marginTop: config.space.S500,
  '@media': {
    'screen and (max-width: 1200px)': {
      fontSize: toRem(30),
    },
    'screen and (max-width: 768px)': {
      fontSize: toRem(20),
    },
  },
});

export const MainHeader = style({
  fontSize: toRem(80),
  fontWeight: config.fontWeight.W900,
  '@media': {
    'screen and (max-width: 1200px)': {
      fontSize: toRem(50),
    },
    'screen and (max-width: 768px)': {
      fontSize: toRem(32),
    },
  },
});

export const Grid = style({
  margin: `${config.space.S700} 0 ${config.space.S700} 0`,
  height: '50%',
  display: 'grid',
  gridTemplateColumns: 'repeat(4 , 1fr)',
  '@media': {
    'screen and (max-width: 1200px)': {
      gridTemplateColumns: 'repeat(3 , 1fr)',
      height: '60%',
    },
    'screen and (max-width: 960px)': {
      gridTemplateColumns: 'repeat(2 , 1fr)',
      height: '70%',
    },
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1 , 1fr)',
      margin: '0',
      height: '85%',
    },
  },
});

export const FlexItems = style({
  display: 'flex',
  height: '100%',
  minHeight: toRem(144),
  width: '100%',
  padding: config.space.S400,
  borderWidth: config.borderWidth.B300,
  boxShadow: config.shadow.E400,
  borderRadius: toRem(5),
  backgroundColor: color.SurfaceVariant.Container,
  '@media': {
    'screen and (max-width: 768px)': {
      minHeight: toRem(166),
    },
  },
});

export const Divider = style({
  width: '100%',
  margin: 'auto',
  marginTop: config.space.S700,
  height: toRem(2),
  backgroundColor: color.Background.ContainerHover,
});

export const FAQContent = style({
  width: '50%',
  margin: 'auto',
  marginTop: config.space.S700,
  '@media': {
    'screen and (max-width: 1200px)': {
      width: '85%',
    },
    'screen and (max-width: 768px)': {
      width: '95%',
    },
  },
});

export const Question = style({
  marginTop: config.space.S700,
  '@media': {
    'screen and (max-width: 1200px)': {
      fontSize: toRem(30),
    },
    'screen and (max-width: 768px)': {
      fontSize: toRem(20),
    },
  },
});

export const Answer = style({
  color: color.Other.FocusRing,
  marginTop: config.space.S300,
  fontWeight: config.fontWeight.W400,
});

export const AllFaqs = style({
  margin: 'auto',
  marginTop: config.space.S700,
});
